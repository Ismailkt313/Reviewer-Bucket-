import { Router } from "express";
import {
  getNotifications,
  markNotificationsRead,
  markSingleNotificationRead,
  viewContentNotifications
} from "./notification.controller.js";

const router = Router();

router.get("/", getNotifications);
router.put("/read", markNotificationsRead);
router.put("/:id/read", markSingleNotificationRead);
router.post("/view-content", viewContentNotifications);

export default router;
