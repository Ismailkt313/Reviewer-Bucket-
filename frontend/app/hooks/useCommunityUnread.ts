import { useState, useEffect, useCallback } from "react";
import { getSocket } from "../utils/socket";
import { getAnonymousClientId } from "../utils/anonymous-id";
import { getApiUrl } from "../utils/api";

export function useCommunityUnread() {
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const fetchCommunityUnread = useCallback(async () => {
    try {
      const clientId = getAnonymousClientId();
      const res = await fetch(getApiUrl(`/api/community/unread?anonymousClientId=${clientId}`), {
        headers: {
          "x-anonymous-client-id": clientId
        }
      });
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          setUnreadCount(json.data.unreadCount || 0);
        }
      }
    } catch (err) {
      console.error("Failed to fetch community unread count:", err);
    }
  }, []);

  const markCommunityRead = useCallback(async () => {
    // Optimistic UI update
    setUnreadCount(0);

    try {
      const clientId = getAnonymousClientId();
      await fetch(getApiUrl("/api/community/read"), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-anonymous-client-id": clientId
        },
        body: JSON.stringify({ anonymousClientId: clientId })
      });
    } catch (err) {
      console.error("Failed to mark community as read:", err);
    }
  }, []);

  useEffect(() => {
    fetchCommunityUnread();

    const socket = getSocket();

    const handleIncrement = () => {
      setUnreadCount((count) => count + 1);
    };

    const handleSync = (data?: { unreadCount?: number }) => {
      const newCount = data && typeof data.unreadCount === "number" ? data.unreadCount : 0;
      setUnreadCount(newCount);
    };

    socket.on("community:unread:increment", handleIncrement);
    socket.on("community:unread:sync", handleSync);

    return () => {
      socket.off("community:unread:increment", handleIncrement);
      socket.off("community:unread:sync", handleSync);
    };
  }, [fetchCommunityUnread]);

  return {
    unreadCount,
    markCommunityRead,
    refetch: fetchCommunityUnread
  };
}
