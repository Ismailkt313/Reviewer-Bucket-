import io, { Socket } from "socket.io-client";
import { getAnonymousClientId } from "./anonymous-id";

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (typeof window === "undefined") {
    return {} as Socket;
  }
  if (!socket) {
    const anonymousClientId = getAnonymousClientId();
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    socket = io(socketUrl, {
      transports: ["websocket"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      auth: { anonymousClientId }
    });
  }
  return socket;
}
