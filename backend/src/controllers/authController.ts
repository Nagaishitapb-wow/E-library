import { Request, Response } from "express";
import { generateToken } from "../utils/generateToken";
import { registerUser, loginUser } from "../services/authService";
import crypto from "crypto";
import { sendResetEmail, sendVerificationEmail } from "../services/emailService";
import { User } from "../models/User";
import bcrypt from "bcrypt";

// ----------------- SIGNUP -----------------
export async function signupController(req: Request, res: Response) {
  try {
    const { name, email, password, role } = req.body; // Allow role for now (or restrict via admin secret later)
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields required" });

    // Basic protection: only allow creating admins if a secret key is provided (omitted for now for simplicity/testing)
    const userRole = role === "admin" ? "admin" : "user";
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await registerUser(name, email, password, userRole, verificationToken);
    await sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Signup failed" });
  }
}

// ----------------- LOGIN -----------------
export async function loginController(req: Request, res: Response) {
  try {
    const { email, password } = req.body;
    const user = await loginUser(email, password);

    if (!user.isVerified) {
      return res.status(403).json({ message: "Please verify your email before logging in." });
    }

    res.json({
      token: generateToken(user._id.toString(), user.role),
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Login failed" });
  }
}

export async function verifyEmailController(req: Request, res: Response) {
  try {
    const { token } = req.body;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired verification token." });
    }

    user.isVerified = true;
    user.verificationToken = undefined;
    await user.save();

    res.json({ message: "Email verified successfully! You can now log in." });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Verification failed" });
  }
}

const authController = { signupController, loginController, forgotPasswordController, resetPasswordController, verifyEmailController };
export default authController;

// forgot password
export async function forgotPasswordController(req: Request, res: Response) {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(400).json({ message: "Email not found" });

  const token = crypto.randomBytes(20).toString("hex");
  user.resetToken = token;
  user.resetTokenExpiry = Date.now() + 1000 * 60 * 10; // 10 min expiry
  await user.save();

  await sendResetEmail(email, token);
  res.json({ message: "Reset email sent" });
}

// reset password
export async function resetPasswordController(req: Request, res: Response) {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetToken: token,
    resetTokenExpiry: { $gt: Date.now() }
  });

  if (!user) return res.status(400).json({ message: "Invalid or expired token" });

  user.passwordHash = await bcrypt.hash(newPassword, 10);
  user.resetToken = undefined;
  user.resetTokenExpiry = undefined;
  await user.save();

  res.json({ message: "Password reset successful" });
}