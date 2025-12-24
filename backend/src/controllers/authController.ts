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
    const { name, email, password, role } = req.body;
    console.log("📨 Signup attempt for:", email);

    if (!name || !email || !password) {
      console.log("❌ Signup failed: Missing fields");
      return res.status(400).json({ message: "All fields required" });
    }

    // Basic protection: only allow creating admins if a secret key is provided (omitted for now for simplicity/testing)
    const userRole = role === "admin" ? "admin" : "user";
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await registerUser(name, email, password, userRole, verificationToken);

    try {
      await sendVerificationEmail(email, verificationToken);
    } catch (emailError: any) {
      console.error("📧 Email sending failed, rolling back user registration:", emailError);
      await User.findByIdAndDelete(user._id);
      throw new Error(`Failed to send verification email: ${emailError.message}. Please check your email and try again.`);
    }

    res.status(201).json({
      message: "Registration successful! Please check your email to verify your account."
    });
  } catch (err: any) {
    console.error("❌ Signup Error:", err.message);
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

    // If email matches ADMIN_EMAIL env, force admin role in token/response
    const role = (user.email === process.env.ADMIN_EMAIL) ? "admin" : user.role;
    const token = generateToken(user._id.toString(), role);

    // Set HTTP-only cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });


    res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: role },
    });
  } catch (err: any) {
    res.status(400).json({ message: err.message || "Login failed" });
  }
}

// ----------------- LOGOUT -----------------
export async function logoutController(req: Request, res: Response) {
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
  res.json({ message: "Logged out successfully" });
}

// ----------------- GET ME -----------------
export async function getMeController(req: Request, res: Response) {
  try {
    const userId = (req as any).user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const user = await User.findById(userId).select("-passwordHash");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to fetch user" });
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

const authController = {
  signupController,
  loginController,
  forgotPasswordController,
  resetPasswordController,
  verifyEmailController,
  logoutController,
  getMeController
};
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