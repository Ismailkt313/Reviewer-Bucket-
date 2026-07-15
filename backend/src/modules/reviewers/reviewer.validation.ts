import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { AppError } from "../../errors/app-error";

const slugSchema = z.object({
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]+$/)
});

export function validateSlug(req: Request, _res: Response, next: NextFunction): void {
  const result = slugSchema.safeParse(req.params);
  if (!result.success) {
    return next(new AppError(400, "Invalid reviewer slug format"));
  }
  req.params.slug = result.data.slug;
  next();
}
