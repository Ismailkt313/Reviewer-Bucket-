import { NotificationRepository } from "./notification.repository.js";
import { NotificationReadModel } from "./notification-read.model.js";
import { INotificationDoc, PublicNotification } from "./notification.types.js";
import { getIO } from "../../socket/socket.js";

export class NotificationService {
  private repository = new NotificationRepository();

  async createNotification(
    type: INotificationDoc["type"],
    message: string,
    senderClientId?: string,
    resourceIds?: {
      experienceId?: string;
      reviewerUpdateId?: string;
      reviewerId?: string;
      reviewerSlug?: string;
    }
  ): Promise<INotificationDoc> {
    // Create the notification in the database
    const notification = await this.repository.create({
      type,
      message,
      senderClientId,
      experienceId: resourceIds?.experienceId,
      reviewerUpdateId: resourceIds?.reviewerUpdateId,
      reviewerId: resourceIds?.reviewerId,
      reviewerSlug: resourceIds?.reviewerSlug,
      createdAt: new Date()
    });

    // If there is a sender client ID, mark it as read for them immediately
    if (senderClientId) {
      await NotificationReadModel.create({
        notificationId: notification._id,
        clientId: senderClientId,
        createdAt: new Date()
      });
    }

    // Broadcast the new notification to all connected users
    this.broadcastNewNotification(notification);

    return notification;
  }

  async getRecentNotifications(clientId: string): Promise<{
    notifications: PublicNotification[];
    unreadCount: number;
  }> {
    const list = await this.repository.getRecent();
    const activeIds = list.map((n) => n._id);

    // Fetch read states for these notifications
    const readRecords = await NotificationReadModel.find({
      clientId,
      notificationId: { $in: activeIds }
    });
    const readIds = new Set(readRecords.map((r) => r.notificationId.toString()));

    const notifications = list.map((n) => ({
      id: n._id.toString(),
      type: n.type,
      message: n.message,
      createdAt: n.createdAt.toISOString(),
      isRead: n.senderClientId === clientId || readIds.has(n._id.toString()),
      experienceId: n.experienceId,
      reviewerUpdateId: n.reviewerUpdateId,
      reviewerId: n.reviewerId,
      reviewerSlug: n.reviewerSlug
    }));

    const unreadCount = await this.repository.getUnreadCount(clientId);

    return {
      notifications,
      unreadCount
    };
  }

  async markAllAsRead(clientId: string): Promise<void> {
    await this.repository.markAllAsRead(clientId);

    // Sync across all tabs/devices of the same user
    const io = getIO();
    if (io) {
      for (const [_, socket] of io.sockets.sockets.entries()) {
        const socketClientId = socket.handshake.auth?.anonymousClientId;
        if (socketClientId === clientId) {
          socket.emit("notification:read:sync", { unreadCount: 0 });
        }
      }
    }
  }

  async markSingleAsRead(notificationId: string, clientId: string): Promise<void> {
    await this.repository.markSingleAsRead(notificationId, clientId);

    const unreadCount = await this.repository.getUnreadCount(clientId);

    // Sync updated count across all tabs/devices of the same user
    const io = getIO();
    if (io) {
      for (const [_, socket] of io.sockets.sockets.entries()) {
        const socketClientId = socket.handshake.auth?.anonymousClientId;
        if (socketClientId === clientId) {
          socket.emit("notification:read:sync", { unreadCount });
        }
      }
    }
  }

  async markNotificationsReadByResourceId(
    clientId: string,
    reviewerId?: string,
    experienceIds?: string[]
  ): Promise<void> {
    const updatedIds = await this.repository.markNotificationsReadByResourceId(
      clientId,
      reviewerId,
      experienceIds
    );

    if (updatedIds.length > 0) {
      const unreadCount = await this.repository.getUnreadCount(clientId);

      // Sync updated count across all tabs/devices of the same user
      const io = getIO();
      if (io) {
        for (const [_, socket] of io.sockets.sockets.entries()) {
          const socketClientId = socket.handshake.auth?.anonymousClientId;
          if (socketClientId === clientId) {
            socket.emit("notification:read:sync", { unreadCount });
          }
        }
      }
    }
  }

  private broadcastNewNotification(notification: INotificationDoc): void {
    const io = getIO();
    if (!io) return;

    const publicNotification = {
      id: notification._id.toString(),
      type: notification.type,
      message: notification.message,
      createdAt: notification.createdAt.toISOString(),
      experienceId: notification.experienceId,
      reviewerUpdateId: notification.reviewerUpdateId,
      reviewerId: notification.reviewerId,
      reviewerSlug: notification.reviewerSlug
    };

    // Iterate through connected sockets to send customized isRead status
    for (const [_, socket] of io.sockets.sockets.entries()) {
      const clientId = socket.handshake.auth?.anonymousClientId;
      if (clientId) {
        const isRead = notification.senderClientId === clientId;
        socket.emit("notification:new", {
          notification: {
            ...publicNotification,
            isRead
          }
        });
      }
    }
  }
}
export const notificationService = new NotificationService();
