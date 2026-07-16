import { Router } from "express";
import { postExperience, getExperiences } from "./experience.controller.js";
import {
  validateReviewerId,
  validatePostExperience,
  validateGetExperiencesQuery
} from "./experience.validation.js";

const router = Router();

router.post("/:reviewerId/experiences", validateReviewerId, validatePostExperience, postExperience);
router.get("/:reviewerId/experiences", validateReviewerId, validateGetExperiencesQuery, getExperiences);

export default router;
