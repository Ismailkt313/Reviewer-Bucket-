import { Server as SocketIOServer, Namespace } from "socket.io";
import { CommunityService } from "./community.service";
import { env } from "../../config/env";
import type { ClientToServerEvents, ServerToClientEvents } from "./community.types";

type CommunityNamespace = Namespace<ClientToServerEvents, ServerToClientEvents>;

const communityService = new CommunityService();

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

function broadcastOnlineCount(nsp: CommunityNamespace): void {
  const count = nsp.sockets.size;
  nsp.emit("community:online-count", { count });
}

export function initCommunitySocket(
  io: SocketIOServer<ClientToServerEvents, ServerToClientEvents>
): void {
  const communityNsp = io.of("/community");

  communityNsp.on("connection", (socket) => {
    console.log("Socket connected");
    const isRateLimited = createRateLimiter();

    broadcastOnlineCount(communityNsp);

    socket.on("community:history:request", async () => {
      try {
        const messages = await communityService.getRecentHistory();
        socket.emit("community:history", { messages });
      } catch {
        socket.emit("community:error", { message: "Failed to load history" });
      }
    });

    socket.on("community:message:send", async (payload, ack) => {
      if (typeof ack !== "function") {
        return;
      }

      if (isRateLimited()) {
        ack({ success: false, message: "Too many messages. Please wait a moment." });
        return;
      }

      const result = await communityService.submitMessage(payload?.content);

      if (!result.success) {
        ack({ success: false, message: result.error });
        return;
      }

      communityNsp.emit("community:message:new", result.message);
      ack({ success: true });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected");
      broadcastOnlineCount(communityNsp);
    });
  });
}
