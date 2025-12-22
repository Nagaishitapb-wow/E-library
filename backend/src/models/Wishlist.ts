import mongoose, { Schema, Document, Types } from "mongoose";

export interface IWishlist extends Document {
  userId: Types.ObjectId;   
  bookId: Types.ObjectId;   
  createdAt: Date;
}

const WishlistSchema = new Schema<IWishlist>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
  createdAt: { type: Date, default: Date.now }
});

WishlistSchema.index({ userId: 1, bookId: 1 }, { unique: true });

export const Wishlist = mongoose.model<IWishlist>("Wishlist", WishlistSchema);
