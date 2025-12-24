import bcrypt from "bcrypt";
import { User } from "../models/User";

export async function registerUser(name: string, email: string, password: string, role: "user" | "admin" = "user", verificationToken?: string) {
  console.log("🔍 Checking if user exists:", email);
  const existing = await User.findOne({ email });
  if (existing) {
    console.log("⚠️ User already exists in DB:", email);
    throw new Error("Email already registered");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  return await User.create({ name, email, passwordHash, role, verificationToken });
}

export async function loginUser(email: string, password: string) {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Invalid credentials");

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) throw new Error("Invalid credentials");

  return user;
}

function validatePasswordServer(pwd: string) {
  if (pwd.length < 8) throw new Error("Password must be 8+ characters");
  if (!/[A-Z]/.test(pwd)) throw new Error("Password must contain uppercase letter");
  if (!/[0-9]/.test(pwd)) throw new Error("Password must contain number");
  if (!/[!@#$%^&*]/.test(pwd)) throw new Error("Password must contain special character");
}
