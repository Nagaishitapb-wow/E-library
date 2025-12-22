import { Router } from "express";
import { getAllUsers } from "../controllers/userController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

// Protected Admin Routes
router.get("/", authRequired, adminRequired, getAllUsers);

export default router;
