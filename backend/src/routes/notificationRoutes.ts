import { Router } from "express";
import { getNotifications, markAsRead, markAllAsRead } from "../controllers/notificationController";
import { authRequired } from "../middleware/auth";

const router = Router();

router.get("/", authRequired, getNotifications);
router.put("/all-read", authRequired, markAllAsRead);
router.put("/:id/read", authRequired, markAsRead);

export default router;
