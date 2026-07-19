import { useState, useEffect, useCallback } from "react";
import { getSocket } from "../utils/socket";
import { getAnonymousClientId } from "../utils/anonymous-id";
import { getApiUrl } from "../utils/api";

export interface NotificationItem {
  id: string;
  type: "new_experience" | "community_message" | "reviewer_approved" | "reviewer_update_approved";
  message: string;
  createdAt: string;
  isRead: boolean;
  experienceId?: string;
  reviewerUpdateId?: string;
  reviewerId?: string;
  reviewerSlug?: string;
}

export function getRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return `${diffDays}d ago`;
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchNotifications = useCallback(async () => {
    try {
      const clientId = getAnonymousClientId();
      const res = await fetch(getApiUrl(`/api/notifications?anonymousClientId=${clientId}`), {
        headers: {
          "x-anonymous-client-id": clientId
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setNotifications(json.data.notifications || []);
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    // Optimistic UI update
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      const clientId = getAnonymousClientId();
      await fetch(getApiUrl("/api/notifications/read"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-client-id": clientId
        },
        body: JSON.stringify({ anonymousClientId: clientId })
      });
    } catch (err) {
      console.error("Failed to mark notifications as read:", err);
    }
  }, []);

  const markSingleAsRead = useCallback(async (id: string) => {
    // Optimistic UI update
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          if (!n.isRead) {
            setUnreadCount((count) => Math.max(0, count - 1));
          }
          return { ...n, isRead: true };
        }
        return n;
      })
    );

    try {
      const clientId = getAnonymousClientId();
      await fetch(getApiUrl(`/api/notifications/${id}/read`), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-client-id": clientId
        },
        body: JSON.stringify({ anonymousClientId: clientId })
      });
    } catch (err) {
      console.error(`Failed to mark notification ${id} as read:`, err);
    }
  }, []);

  const markContentAsRead = useCallback(async (reviewerId?: string, experienceIds?: string[]) => {
    try {
      const clientId = getAnonymousClientId();
      const res = await fetch(getApiUrl("/api/notifications/view-content"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-client-id": clientId
        },
        body: JSON.stringify({
          anonymousClientId: clientId,
          reviewerId,
          experienceIds
        })
      });
      if (res.ok) {
        // Refetch to pull the updated read flags and unread counts
        fetchNotifications();
      }
    } catch (err) {
      console.error("Failed to sync manually viewed content notifications:", err);
    }
  }, [fetchNotifications]);

  useEffect(() => {
    fetchNotifications();

    const socket = getSocket();

    const handleNewNotification = (data: { notification: Omit<NotificationItem, "isRead"> & { isRead?: boolean } }) => {
      const { notification } = data;
      const isRead = notification.isRead ?? false;

      // Filter out community message notifications from Notification Center
      if (notification.type === "community_message") {
        return;
      }

      setNotifications((prev) => {
        // Prevent duplicate entries
        if (prev.some((n) => n.id === notification.id)) return prev;
        return [
          {
            ...notification,
            isRead
          } as NotificationItem,
          ...prev
        ];
      });

      if (!isRead) {
        setUnreadCount((count) => count + 1);
      }
    };

    const handleReadSync = (data?: { unreadCount?: number }) => {
      if (data && typeof data.unreadCount === "number") {
        setUnreadCount(data.unreadCount);
        fetchNotifications();
      } else {
        setUnreadCount(0);
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      }
    };

    socket.on("notification:new", handleNewNotification);
    socket.on("notification:read:sync", handleReadSync);

    return () => {
      socket.off("notification:new", handleNewNotification);
      socket.off("notification:read:sync", handleReadSync);
    };
  }, [fetchNotifications]);

  return {
    notifications: notifications.filter((n) => n.type !== "community_message"),
    unreadCount,
    loading,
    markAllAsRead,
    markSingleAsRead,
    markContentAsRead,
    refetch: fetchNotifications
  };
}
