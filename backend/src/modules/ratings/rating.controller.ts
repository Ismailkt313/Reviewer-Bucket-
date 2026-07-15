import { Request, Response, NextFunction } from "express";
import { RatingService } from "./rating.service";

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
    const data = await ratingService.getRatingSummary(reviewerId);
    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};
