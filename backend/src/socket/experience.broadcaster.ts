import { getIO } from "./socket.js";

export class ExperienceBroadcaster {
  static broadcastNewExperience(experience: {
    id: string;
    reviewerId: string;
    content: string;
    createdAt: string | Date;
  }): void {
    const io = getIO();
    if (io) {
      const createdAtStr = typeof experience.createdAt === "string"
        ? experience.createdAt
        : experience.createdAt.toISOString();

      io.to(`reviewer:${experience.reviewerId}`).emit("experience:new", {
        id: experience.id,
        reviewerId: experience.reviewerId,
        content: experience.content,
        createdAt: createdAtStr
      });
    }
  }
}
