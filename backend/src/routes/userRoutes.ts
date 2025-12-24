import { Router } from "express";
import { getAllUsers, getUserProfile, updateUserProfile, changePassword } from "../controllers/userController";
import { authRequired, adminRequired } from "../middleware/auth";

const router = Router();

// Protected User Routes
router.get("/profile", authRequired, getUserProfile);
router.put("/profile", authRequired, updateUserProfile);
router.put("/change-password", authRequired, changePassword);

// Protected Admin Routes
router.get("/", authRequired, adminRequired, getAllUsers);

export default router;
