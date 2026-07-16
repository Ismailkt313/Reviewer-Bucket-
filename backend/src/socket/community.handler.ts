import { Socket } from "socket.io";
import { RealtimeSocketServer } from "./socket.js";
import { CommunityService } from "../modules/community/community.service.js";
import { env } from "../config/env.js";
import { CommunityBroadcaster } from "./community.broadcaster.js";
import type { InternalCommunityMessage, PublicCommunityMessage } from "../modules/community/community.types.js";

const communityService = new CommunityService();

function toPublicMessage(msg: InternalCommunityMessage, isMine: boolean): PublicCommunityMessage {
  return {
    id: msg.id,
    content: msg.content,
    createdAt: msg.createdAt,
    isMine
  };
}

function createRateLimiter() {
  const timestamps: number[] = [];
  return function isRateLimited(): boolean {
    const now = Date.now();
    const windowStart = now - env.COMMUNITY_RATE_LIMIT_WINDOW_MS;
    while (timestamps.length > 0 && timestamps[0] <= windowStart) {
      timestamps.shift();
    }
    if (timestamps.length >= env.COMMUNITY_RATE_LIMIT_MAX_MESSAGES) {
      return true;
    }
    timestamps.push(now);
    return false;
  };
}

export function registerCommunityHandlers(io: RealtimeSocketServer, socket: Socket): void {
  const anonymousClientId: string = socket.handshake.auth.anonymousClientId;
  const isRateLimited = createRateLimiter();

  CommunityBroadcaster.broadcastOnlineCount(io.sockets.sockets.size);

  socket.on("community:history:request", async () => {
    try {
      const internalMessages = await communityService.getRecentHistory();
      const messages = internalMessages.map((msg) =>
        toPublicMessage(msg, msg.anonymousClientId === anonymousClientId)
      );
      socket.emit("community:history", { messages });
    } catch {
      socket.emit("community:error", { message: "Failed to load history" });
    }
  });

  socket.on("community:message:send", async (
    payload: { content: string },
    ack: (response: { success: boolean; message?: string; messageId?: string }) => void
  ) => {
    if (typeof ack !== "function") {
      return;
    }
    if (isRateLimited()) {
      ack({ success: false, message: "Too many messages. Please wait a moment." });
      return;
    }
    const result = await communityService.submitMessage(payload?.content, anonymousClientId);
    if (!result.success) {
      ack({ success: false, message: result.error });
      return;
    }

    const publicMsg = toPublicMessage(result.message, false);
    CommunityBroadcaster.broadcastMessage(publicMsg, socket.id);
    ack({ success: true, messageId: result.message.id });
  });

  socket.on("disconnect", () => {
    CommunityBroadcaster.broadcastOnlineCount(io.sockets.sockets.size);
  });
}
