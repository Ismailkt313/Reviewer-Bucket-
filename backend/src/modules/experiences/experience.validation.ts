import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { Types } from "mongoose";
import { AppError } from "../../errors/app-error";

const postExperienceSchema = z.object({
  content: z.string().trim().min(2).max(1000),
  anonymousClientId: z.string().trim().optional()
}).strict();

const getExperiencesQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  cursor: z.string().optional()
});

export function validateReviewerId(req: Request, _res: Response, next: NextFunction): void {
  const { reviewerId } = req.params;
  if (!Types.ObjectId.isValid(reviewerId)) {
    console.error(`[EXPERIENCE_VALIDATION] [FAIL] Invalid reviewerId format: "${reviewerId}"`);
    return next(new AppError(400, "Invalid reviewer ID format"));
  }
  next();
}

export function validatePostExperience(req: Request, _res: Response, next: NextFunction): void {
  const result = postExperienceSchema.safeParse(req.body);
  if (!result.success) {
    console.error(`[EXPERIENCE_VALIDATION] [FAIL] Body validation failed for payload:`, req.body, `Errors:`, result.error.errors);
    return next(new AppError(400, "Invalid experience request payload"));
  }
  req.body = result.data;
  next();
}

export function validateGetExperiencesQuery(req: Request, _res: Response, next: NextFunction): void {
  const result = getExperiencesQuerySchema.safeParse(req.query);
  if (!result.success) {
    console.error(`[EXPERIENCE_VALIDATION] [FAIL] Query validation failed for query:`, req.query, `Errors:`, result.error.errors);
    return next(new AppError(400, "Invalid query parameters"));
  }
  req.query = result.data as unknown as Request["query"];
  next();
}
