import { createServer } from "http";
import app from "./app";
import { env } from "./config/env";
import { connectDatabase, disconnectDatabase } from "./config/database";
import { initSocket, getIO } from "./socket/socket.js";

const httpServer = createServer(app);

let isShuttingDown = false;

async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;
  console.log(`Received ${signal}. Starting graceful shutdown...`);

  const io = getIO();
  if (io) {  
    io.close(() => {
      console.log("Socket.IO closed");
    });
  }

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
    initSocket(httpServer);
    httpServer.listen(env.PORT, () => {
      console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
    });
  } catch {
    console.error("Bootstrap failed to initialize database connection");
    process.exit(1);
  }
}

bootstrap().catch(() => process.exit(1));
