import { Request, Response, NextFunction } from "express";
import { ExperienceService } from "./experience.service.js";
import { cacheService } from "../../utils/cache";
import { triggerRevalidate } from "../../utils/revalidate";
import { ReviewerModel } from "../reviewers/reviewer.model.js";

const experienceService = new ExperienceService();

export const postExperience = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { reviewerId } = req.params;
  const { content, anonymousClientId } = req.body;
  const contentPreview = content ? (content.substring(0, 30) + (content.length > 30 ? "..." : "")) : "";

  console.log(`[EXPERIENCE_SUBMISSION] [START] Initiating experience submit for reviewerId=${reviewerId}, contentPreview="${contentPreview}"`);

  try {
    const experience = await experienceService.submitExperience(reviewerId, content);
    console.log(`[EXPERIENCE_SUBMISSION] [SUCCESS] Experience created in DB: id=${experience._id.toString()} for reviewerId=${reviewerId}`);

    // Invalidate caches
    await Promise.all([
      cacheService.delPattern(`experiences:list:${reviewerId}:*`),
      cacheService.del("reviewers:list")
    ]);

    // On-demand frontend cache revalidation
    triggerRevalidate("reviewers");

    try {
      const { ExperienceBroadcaster } = await import("../../socket/experience.broadcaster.js");
      ExperienceBroadcaster.broadcastNewExperience({
        id: experience._id.toString(),
        reviewerId: experience.reviewerId.toString(),
        content: experience.content,
        createdAt: experience.createdAt
      });
      console.log(`[EXPERIENCE_SUBMISSION] [BROADCAST] Broadcasted new experience id=${experience._id.toString()}`);
    } catch (err) {
      console.error(`[EXPERIENCE_SUBMISSION] [ERROR] Failed to broadcast experience id=${experience._id.toString()}:`, err);
    }

    // Trigger experience shared notification asynchronously
    ReviewerModel.findById(reviewerId)
      .then((reviewer) => {
        if (reviewer) {
          import("../notifications/notification.service.js")
            .then(({ notificationService }) => {
              notificationService.createNotification(
                "new_experience",
                `A new experience was shared for ${reviewer.code}.`,
                anonymousClientId,
                {
                  experienceId: experience._id.toString(),
                  reviewerId: reviewer._id.toString(),
                  reviewerSlug: reviewer.slug
                }
              );
            })
            .catch((err) => {
              console.error("Failed to create experience notification:", err);
            });
        }
      })
      .catch((err) => {
        console.error("Failed to find reviewer for experience notification:", err);
      });

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
    console.error(`[EXPERIENCE_SUBMISSION] [FAILURE] Error submitting experience for reviewerId=${reviewerId}:`, error);
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

    const cacheKey = `experiences:list:${reviewerId}:limit:${limit}:cursor:${cursor || "none"}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached
      });
      return;
    }

    const result = await experienceService.getExperiences(reviewerId, limit, cursor);

    const experiences = result.experiences.map((exp) => ({
      id: exp._id.toString(),
      content: exp.content,
      createdAt: exp.createdAt.toISOString()
    }));

    const responseData = {
      experiences,
      nextCursor: result.nextCursor,
      hasMore: result.hasMore
    };

    await cacheService.set(cacheKey, responseData, 30); // 30 seconds TTL

    res.status(200).json({
      success: true,
      data: responseData
    });
  } catch (error) {
    next(error);
  }
};
