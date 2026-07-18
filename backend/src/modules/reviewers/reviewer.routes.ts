import { Router } from "express";
import {
  getAllReviewers,
  getReviewerBySlug,
  createReviewer,
  updateReviewer,
  getAllRequests,
  approveRequest,
  rejectRequest,
  getAllUpdateRequests,
  approveUpdateRequest,
  rejectUpdateRequest
} from "./reviewer.controller";
import { validateSlug, validateCreateReviewer } from "./reviewer.validation";

const router = Router();

router.get("/", getAllReviewers);
router.post("/", validateCreateReviewer, createReviewer);
router.patch("/:id", validateCreateReviewer, updateReviewer);
router.get("/requests", getAllRequests);
router.post("/requests/:id/approve", approveRequest);
router.post("/requests/:id/reject", rejectRequest);
router.get("/update-requests", getAllUpdateRequests);
router.post("/update-requests/:id/approve", approveUpdateRequest);
router.post("/update-requests/:id/reject", rejectUpdateRequest);
router.get("/:slug", validateSlug, getReviewerBySlug);

export default router;
    