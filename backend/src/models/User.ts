import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: "user" | "admin";
  isVerified: boolean;
  verificationToken?: string | undefined;
  resetToken?: string | undefined;
  resetTokenExpiry?: number | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ["user", "admin"], default: "user" },
  isVerified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  resetToken: { type: String, default: null },
  resetTokenExpiry: { type: Number, default: null },
}, {
  timestamps: true
});

export const User = mongoose.model<IUser>("User", UserSchema);
