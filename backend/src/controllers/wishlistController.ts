import { Request, Response } from "express";
import { Wishlist } from "../models/Wishlist";

export async function addToWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json({ message: "Book ID is required" });
    }

    const item = await Wishlist.create({ userId, bookId });

    res.json({ message: "Book added to wishlist", item });
  } catch (err: any) {
    if (err.code === 11000) {
      return res.status(400).json({ message: "This book is already in your wishlist" });
    }
    console.error("Add to wishlist error:", err);
    res.status(500).json({ message: err.message || "Failed to add to wishlist" });
  }
}

export async function removeFromWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!._id;
    const { bookId } = req.params;

    await Wishlist.findOneAndDelete({ userId, bookId });

    res.json({ message: "Removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getUserWishlist(req: Request, res: Response) {
  try {
    const userId = req.user!._id;

    const list = await Wishlist.find({ userId })
      .populate("bookId", "title author coverImage description");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch wishlist" });
  }
}
