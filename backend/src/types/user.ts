import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
    id:number;
  name: string;
  email: string;
  passwordHash: string;
  resetToken?: string;          
  resetTokenExpiry?: number;    
}

const UserSchema: Schema<IUser> = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },

  resetToken: { type: String },            
  resetTokenExpiry: { type: Number }
});

export const User = mongoose.model<IUser>("User", UserSchema);
