import { Socket } from "socket.io";
import { RealtimeSocketServer } from "./socket.js";

export function registerExperienceHandlers(_io: RealtimeSocketServer, socket: Socket): void {
  socket.on("reviewer:join", (payload: { reviewerId: string }) => {
    if (payload?.reviewerId) {
      socket.join(`reviewer:${payload.reviewerId}`);
    }
  });

  socket.on("reviewer:leave", (payload: { reviewerId: string }) => {
    if (payload?.reviewerId) {
      socket.leave(`reviewer:${payload.reviewerId}`);
    }
  });
}
