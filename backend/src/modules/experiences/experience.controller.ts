import { Request, Response, NextFunction } from "express";
import { ExperienceService } from "./experience.service.js";

const experienceService = new ExperienceService();

export const postExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    const { content } = req.body;
    const experience = await experienceService.submitExperience(reviewerId, content);

    try {
      const { ExperienceBroadcaster } = await import("../../socket/experience.broadcaster.js");
      ExperienceBroadcaster.broadcastNewExperience({
        id: experience._id.toString(),
        reviewerId: experience.reviewerId.toString(),
        content: experience.content,
        createdAt: experience.createdAt
      });
    } catch (err) {
      console.error("Failed to broadcast experience", err);
    }

    res.status(201).json({
      success: true,
      message: "Experience submitted successfully.",
      data: {
        id: experience._id.toString(),
        reviewerId: experience.reviewerId.toString(),
        content: experience.content,
        createdAt: experience.createdAt.toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getExperiences = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    const { limit, cursor } = req.query as unknown as { limit: number; cursor?: string };
    const result = await experienceService.getExperiences(reviewerId, limit, cursor);

    const experiences = result.experiences.map((exp) => ({
      id: exp._id.toString(),
      content: exp.content,
      createdAt: exp.createdAt.toISOString()
    }));

    res.status(200).json({
      success: true,
      data: {
        experiences,
        nextCursor: result.nextCursor,
        hasMore: result.hasMore
      }
    });
  } catch (error) {
    next(error);
  }
};
