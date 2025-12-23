import { Router } from "express";
import authController from "../controllers/authController";
import { authRequired } from "../middleware/auth";
import { forgotPasswordController, resetPasswordController } from "../controllers/authController";

const router = Router();

router.post("/signup", authController.signupController);
router.post("/login", authController.loginController);
router.post("/logout", authController.logoutController);
router.get("/me", authRequired, authController.getMeController);
router.post("/forgot-password", forgotPasswordController);
router.post("/reset-password", resetPasswordController);
router.post("/verify-email", authController.verifyEmailController);

router.get("/profile", authRequired, (req, res) => {
  res.json({ message: "Protected route active", user: (req as any).user });
});

export default router;
