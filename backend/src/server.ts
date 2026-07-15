import { createServer } from "http";
import { Server as SocketIOServer } from "socket.io";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { initCommunitySocket } from "./modules/community/community.socket";
import type { ClientToServerEvents, ServerToClientEvents } from "./modules/community/community.types";

const httpServer = createServer(app);

const io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: env.CLIENT_URL,
    methods: ["GET", "POST"]
  }
});

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  io.close(() => {
    console.log("Socket.IO closed");
  });

  httpServer.close(async () => {
    console.log("HTTP server closed");
    try {
      await disconnectDatabase();
      console.log("Cleanup complete. Exiting.");
      process.exit(0);
    } catch {
      console.error("Error during graceful shutdown cleanup");
      process.exit(1);
    }
  });
}

process.on("SIGINT", () => {
  gracefulShutdown("SIGINT").catch(() => process.exit(1));
});

process.on("SIGTERM", () => {
  gracefulShutdown("SIGTERM").catch(() => process.exit(1));
});

async function bootstrap(): Promise<void> {
  try {
    await connectDatabase();
    initCommunitySocket(io);
    httpServer.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch {
    console.error("Bootstrap failed to initialize database connection");
    process.exit(1);
  }
}

bootstrap().catch(() => process.exit(1));
