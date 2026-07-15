import { Router } from "express";
import { putRating, getRatingSummary } from "./rating.controller";
import { validateReviewerId, validatePutRating } from "./rating.validation";

const router = Router();

router.put("/:reviewerId/rating", validateReviewerId, validatePutRating, putRating);
router.get("/:reviewerId/rating-summary", validateReviewerId, getRatingSummary);

export default router;
