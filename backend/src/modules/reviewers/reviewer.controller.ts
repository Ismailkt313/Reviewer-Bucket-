import { Request, Response, NextFunction } from "express";
import { ReviewerService } from "./reviewer.service";
import { cacheService } from "../../utils/cache";

const reviewerService = new ReviewerService();

export const getAllReviewers = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const cacheKey = "reviewers:list";
    const cached = await cacheService.get<any[]>(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached
      });
      return;
    }

    const reviewers = await reviewerService.getAllReviewersWithStats();
    const data = reviewers.map((r) => ({
      id: r._id.toString(),
      name: r.name,
      code: r.code,
      slug: r.slug,
      stacks: r.stacks,
      stats: r.stats
    }));

    await cacheService.set(cacheKey, data, 300); // 5 minutes TTL

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewerBySlug = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { slug } = req.params;
    const cacheKey = `reviewers:slug:${slug}`;
    const cached = await cacheService.get<any>(cacheKey);
    if (cached) {
      res.status(200).json({
        success: true,
        data: cached
      });
      return;
    }

    const reviewer = await reviewerService.getReviewerBySlug(slug);
    const data = {
      id: reviewer._id.toString(),
      name: reviewer.name,
      code: reviewer.code,
      slug: reviewer.slug,
      stacks: reviewer.stacks
    };

    await cacheService.set(cacheKey, data, 3600); // 1 hour TTL

    res.status(200).json({
      success: true,
      data
    });
  } catch (error) {
    next(error);
  }
};

export const createReviewer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { name, code, stacks } = req.body;
    const reviewer = await reviewerService.createReviewer({ name, code, stacks });

    // Invalidate list cache
    await cacheService.del("reviewers:list");

    res.status(201).json({
      success: true,
      data: {
        id: reviewer._id.toString(),
        name: reviewer.name,
        code: reviewer.code,
        slug: reviewer.slug,
        stacks: reviewer.stacks
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updateReviewer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, code, stacks } = req.body;

    // Get original details to purge old slug cache if it changes
    let originalSlug = "";
    try {
      const original = await reviewerService.getReviewerBySlug(req.params.id); // might be ID or slug
      originalSlug = original.slug;
    } catch {}

    const reviewer = await reviewerService.updateReviewer(id, { name, code, stacks });

    // Invalidate caches
    await Promise.all([
      cacheService.del("reviewers:list"),
      cacheService.del(`reviewers:slug:${reviewer.slug}`),
      originalSlug ? cacheService.del(`reviewers:slug:${originalSlug}`) : Promise.resolve()
    ]);

    res.status(200).json({
      success: true,
      data: {
        id: reviewer._id.toString(),
        name: reviewer.name,
        code: reviewer.code,
        slug: reviewer.slug,
        stacks: reviewer.stacks
      }
    });
  } catch (error) {
    next(error);
  }
};
