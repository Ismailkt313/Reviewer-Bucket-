import { Request, Response, NextFunction } from "express";
import { RatingService } from "./rating.service";
import { cacheService } from "../../utils/cache";

const ratingService = new RatingService();

export const putRating = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    const { anonymousClientId, value } = req.body;
    const updated = await ratingService.submitRating(reviewerId, anonymousClientId, value);

    // Invalidate caches
    await Promise.all([
      cacheService.del(`ratings:summary:${reviewerId}`),
      cacheService.del("reviewers:list")
    ]);

    res.status(200).json({
      success: true,
      data: {
        value: updated.value
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getRatingSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { reviewerId } = req.params;
    const cacheKey = `ratings:summary:${reviewerId}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached
      });
      return;
    }

    const data = await ratingService.getRatingSummary(reviewerId);
    await cacheService.set(cacheKey, data, 3600); // 1 hour TTL

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
