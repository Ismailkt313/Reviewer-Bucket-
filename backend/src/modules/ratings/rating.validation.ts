import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { AppError } from "../../errors/app-error";

const putRatingSchema = z.object({
  anonymousClientId: z.string().uuid(),
  value: z.number().int().min(1).max(5)
});

export function validateReviewerId(req: Request, _res: Response, next: NextFunction): void {
  const { reviewerId } = req.params;
  if (!Types.ObjectId.isValid(reviewerId)) {
    return next(new AppError(400, "Invalid reviewer ID format"));
  }
  next();
}

export function validatePutRating(req: Request, _res: Response, next: NextFunction): void {
  const result = putRatingSchema.safeParse(req.body);
  if (!result.success) {
    return next(new AppError(400, "Invalid rating request payload"));
  }
  req.body = result.data;
  next();
}
