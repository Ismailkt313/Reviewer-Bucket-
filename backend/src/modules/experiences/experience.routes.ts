import { Router } from "express";
import { postExperience, getExperiences } from "./experience.controller";
import {
  validateReviewerId,
  validatePostExperience,
  validateGetExperiencesQuery
} from "./experience.validation";

const router = Router();

router.post("/:reviewerId/experiences", validateReviewerId, validatePostExperience, postExperience);
router.get("/:reviewerId/experiences", validateReviewerId, validateGetExperiencesQuery, getExperiences);

export default router;
