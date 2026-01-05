import { Router } from "express";
import { getLogs } from "../controllers/activityController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

// Only admins can view activity logs
router.get("/", authRequired, adminRequired, getLogs);

export default router;
