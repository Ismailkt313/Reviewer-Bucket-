import { Request, Response, NextFunction } from "express";
import { ExperienceService } from "./experience.service";

const experienceService = new ExperienceService();

export const postExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    const { content } = req.body;
    await experienceService.submitExperience(reviewerId, content);
    res.status(201).json({
      success: true,
      message: "Experience submitted for review."
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
    const result = await experienceService.getApprovedExperiences(reviewerId, limit, cursor);

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
