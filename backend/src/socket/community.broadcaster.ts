import { getIO } from "./socket.js";
import type { PublicCommunityMessage } from "../modules/community/community.types.js";

export class CommunityBroadcaster {
  static broadcastMessage(message: PublicCommunityMessage, senderSocketId?: string): void {
    const io = getIO();
    if (io) {
      if (senderSocketId) {
        const senderSocket = io.sockets.sockets.get(senderSocketId);
        if (senderSocket) {
          senderSocket.emit("community:message:new", { ...message, isMine: true });
          senderSocket.broadcast.emit("community:message:new", { ...message, isMine: false });
          return;
        }
      }
      io.emit("community:message:new", message);
    }
  }

  static broadcastOnlineCount(count: number): void {
    const io = getIO();
    if (io) {
      io.emit("community:online-count", { count });
    }
  }
}
