import { Router } from "express";
import { getCommunityUnreadCount, markCommunityAsRead } from "./community.controller.js";

const router = Router();

router.get("/unread", getCommunityUnreadCount);
router.put("/read", markCommunityAsRead);

export default router;
