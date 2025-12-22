import { Schema, model, Document, Types } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description?: string;
  rating: number;
  pdfUrl?: string;
  coverImage: string;
  category: Types.ObjectId | null;
  price?: number;
  isbn?: string;
  stock: number;
  status: "available" | "issued" | "reserved" | "archived" | "damaged" | "lost" | "digital_only";
  addedBy?: Types.ObjectId | null; // Admin reference (for later)
  reviews?: { user: Types.ObjectId; rating: number; comment?: string }[];
}

const BookSchema = new Schema<IBook>({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  rating: { type: Number, default: 0 },
  pdfUrl: { type: String },
  coverImage: { type: String, required: false },
  category: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  price: { type: Number },
  isbn: { type: String, default: null },
  stock: { type: Number, default: 1 },
  status: {
    type: String,
    enum: ["available", "issued", "reserved", "archived", "damaged", "lost", "digital_only"],
    default: "available"
  },
  addedBy: { type: Schema.Types.ObjectId, ref: "Admin", default: null },
  reviews: [
    {
      user: { type: Schema.Types.ObjectId, ref: "User", required: true },
      rating: { type: Number, required: true, min: 1, max: 5 },
      comment: { type: String, default: "" }
    }
  ]
}, { timestamps: true });

export const Book = model<IBook>("Book", BookSchema);
