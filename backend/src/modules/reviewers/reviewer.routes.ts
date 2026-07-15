import { Router } from "express";
import { getAllReviewers, getReviewerBySlug } from "./reviewer.controller";
import { validateSlug } from "./reviewer.validation";

const router = Router();

router.get("/", getAllReviewers);
router.get("/:slug", validateSlug, getReviewerBySlug);

export default router;
