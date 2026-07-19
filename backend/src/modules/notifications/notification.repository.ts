import { NotificationModel } from "./notification.model.js";
import { NotificationReadModel } from "./notification-read.model.js";
import { INotificationDoc } from "./notification.types.js";

export class NotificationRepository {
  async create(data: Partial<INotificationDoc>): Promise<INotificationDoc> {
    const notification = new NotificationModel(data);
    return await notification.save();
  }

  async getRecent(limit: number = 50): Promise<INotificationDoc[]> {
    return await NotificationModel.find()
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async getUnreadCount(clientId: string): Promise<number> {
    // Get active notifications not sent by this client
    const activeNotifications = await NotificationModel.find({
      senderClientId: { $ne: clientId }
    });
    const activeIds = activeNotifications.map((n) => n._id);

    // Get read notification IDs for this client
    const readRecords = await NotificationReadModel.find({
      clientId,
      notificationId: { $in: activeIds }
    });
    const readIds = new Set(readRecords.map((r) => r.notificationId.toString()));

    // Return the count of active notifications that haven't been read by this client
    return activeNotifications.filter((n) => !readIds.has(n._id.toString())).length;
  }

  async markAllAsRead(clientId: string): Promise<void> {
    const activeNotifications = await NotificationModel.find({
      senderClientId: { $ne: clientId }
    });
    const activeIds = activeNotifications.map((n) => n._id);

    const readRecords = await NotificationReadModel.find({
      clientId,
      notificationId: { $in: activeIds }
    });
    const readIds = new Set(readRecords.map((r) => r.notificationId.toString()));

    const unreadIds = activeIds.filter((id) => !readIds.has(id.toString()));

    if (unreadIds.length > 0) {
      const docsToInsert = unreadIds.map((id) => ({
        notificationId: id,
        clientId,
        createdAt: new Date()
      }));
      await NotificationReadModel.insertMany(docsToInsert, { ordered: false });
    }
  }

  async markSingleAsRead(notificationId: string, clientId: string): Promise<void> {
    await NotificationReadModel.findOneAndUpdate(
      { notificationId, clientId },
      { createdAt: new Date() },
      { upsert: true, new: true }
    );
  }

  async markNotificationsReadByResourceId(
    clientId: string,
    reviewerId?: string,
    experienceIds?: string[]
  ): Promise<string[]> {
    const query: any = {};
    const orConditions: any[] = [];

    if (reviewerId) {
      orConditions.push({ type: { $in: ["reviewer_approved", "reviewer_update_approved"] }, reviewerId });
    }
    if (experienceIds && experienceIds.length > 0) {
      orConditions.push({ type: "new_experience", experienceId: { $in: experienceIds } });
    }

    if (orConditions.length === 0) return [];
    query.$or = orConditions;

    const matchingNotifications = await NotificationModel.find(query);
    const matchingIds = matchingNotifications.map((n) => n._id);

    if (matchingIds.length > 0) {
      const readRecords = await NotificationReadModel.find({
        clientId,
        notificationId: { $in: matchingIds }
      });
      const readIds = new Set(readRecords.map((r) => r.notificationId.toString()));
      const unreadIds = matchingIds.filter((id) => !readIds.has(id.toString()));

      if (unreadIds.length > 0) {
        const docsToInsert = unreadIds.map((id) => ({
          notificationId: id,
          clientId,
          createdAt: new Date()
        }));
        await NotificationReadModel.insertMany(docsToInsert, { ordered: false });
        return unreadIds.map((id) => id.toString());
      }
    }
    return [];
  }
}
export const notificationRepository = new NotificationRepository();
