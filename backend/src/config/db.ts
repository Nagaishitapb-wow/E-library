import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("MongoDB Connected Successfully");
  } catch (err) {
    console.error("DB Connection Failed:", err);
    process.exit(1);
  }
}
