import type { Request, Response } from "express";
import { Book } from "../models/Book";
import BorrowedBook from "../models/Borrow";
import { escapeRegExp } from "../utils/regexHelper";
import { Wishlist } from "../models/Wishlist";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { logActivity } from "./activityController";

export async function getAllBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;
    const category = req.query.category as string;
    const sortBy = req.query.sortBy as string || "createdAt";
    const skip = (page - 1) * limit;

    const filter: any = {};
    if (category) {
      filter.category = category;
    }

    const sortOptions: any = {};
    if (sortBy === "rating") {
      sortOptions.rating = -1;
    } else {
      sortOptions.createdAt = -1;
    }

    const [books, total] = await Promise.all([
      Book.find(filter)
        .populate("category", "name description")
        .skip(skip)
        .limit(limit)
        .sort(sortOptions),
      Book.countDocuments(filter),
    ]);

    res.json({
      data: books,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error("Error fetching books", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
}


export async function getBookById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const book = await Book.findById(id)
      .populate("category", "name description")
      .populate("reviews.user", "name");

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
    res.json(book);
  } catch (err) {
    console.error("Error fetching book", err);
    res.status(500).json({ message: "Failed to fetch book" });
  }
}

export async function getUserBorrowedBooks(req: Request, res: Response) {
  try {
    if (!req.user?._id) return res.status(401).json({ message: "Unauthorized" });

    const borrowed = await BorrowedBook.find({ userId: req.user._id })
      .populate("bookId", "title author coverImage description");

    return res.json(borrowed);
  } catch (err: any) {
    return res.status(500).json({ message: err.message || "Error fetching borrowed books" });
  }
}

export async function rateBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { rating, comment } = req.body;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Login required" });
    if (rating < 1 || rating > 5) return res.status(400).json({ message: "Rating must be 1-5" });

    const book = await Book.findById(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Initialize reviews if undefined
    if (!book.reviews) {
      book.reviews = [];
    }

    const existingReview = book.reviews.find(r => r.user.toString() === userId.toString());

    if (existingReview) {
      existingReview.rating = rating;
      existingReview.comment = comment || existingReview.comment;
    } else {
      book.reviews = book.reviews || [];
      book.reviews.push({ user: userId, rating, comment });
    }

    // Recalculate average rating
    const totalRating = book.reviews.reduce((acc, curr) => acc + curr.rating, 0);
    book.rating = parseFloat((totalRating / book.reviews.length).toFixed(1));

    await book.save();

    // Re-fetch with populated user names
    const updatedBook = await Book.findById(id)
      .populate("category", "name description")
      .populate("reviews.user", "name");

    res.json({ message: "Rating added/updated", book: updatedBook });

  } catch (err: any) {
    res.status(500).json({ message: err.message || "Rating failed" });
  }
}

export async function createBook(req: Request, res: Response) {
  try {
    const { title, author, description, coverImage, category, price, stock, totalStock, isbn } = req.body;

    const safeTitle = escapeRegExp(title);
    const safeAuthor = escapeRegExp(author);

    const existingBook = await Book.findOne({
      title: { $regex: new RegExp(`^${safeTitle}$`, "i") },
      author: { $regex: new RegExp(`^${safeAuthor}$`, "i") }
    });

    if (existingBook) {
      return res.status(400).json({ message: "Book with this Title and Author already exists" });
    }


    const newBook = new Book({
      title,
      author,
      description,
      coverImage,
      category,
      price,
      stock: stock || totalStock || 1, // Handle varied naming
      isbn
    });

    await newBook.save();

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Book Created", `Created book "${newBook.title}" by ${newBook.author}`, "book");
    }

    res.status(201).json(newBook);
  } catch (err: any) {
    console.error("Create book error:", err);
    res.status(500).json({ message: err.message || "Failed to create book" });
  }
}



export async function updateBook(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const oldBook = await Book.findById(id);
    if (!oldBook) return res.status(404).json({ message: "Book not found" });

    const newBook = await Book.findByIdAndUpdate(id, updates, { new: true });
    if (!newBook) return res.status(404).json({ message: "Book not found" });

    // Check if stock was 0 and is now > 0
    if (oldBook.stock === 0 && newBook.stock > 0) {
      const wishlistEntries = await Wishlist.find({ bookId: id });

      const notifications = wishlistEntries.map(entry => ({
        userId: entry.userId,
        bookId: id,
        message: `📚 Great news! "${newBook.title}" is now back in stock!`
      }));

      if (notifications.length > 0) {
        await Notification.insertMany(notifications);
      }
    }

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Book Updated", `Updated book "${newBook.title}"`, "book");
    }

    res.json(newBook);
  } catch (err: any) {
    console.error("Update book error:", err);
    res.status(500).json({ message: err.message || "Failed to update book" });
  }
}

export async function deleteBook(req: Request, res: Response) {
  try {
    const { id } = req.params;

    // Check if the book is currently borrowed
    const activeBorrow = await BorrowedBook.findOne({ bookId: id, returned: false });
    if (activeBorrow) {
      return res.status(400).json({
        message: "This book is currently borrowed by a user and cannot be deleted."
      });
    }

    const book = await Book.findByIdAndDelete(id);
    if (!book) return res.status(404).json({ message: "Book not found" });

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Book Deleted", `Deleted book "${book.title}"`, "book");
    }

    res.json({ message: "Book deleted successfully" });
  } catch (err: any) {
    console.error("Delete book error:", err);
    res.status(500).json({ message: err.message || "Failed to delete book" });
  }
}

export async function bulkUpdateCategory(req: Request, res: Response) {
  try {
    const { bookIds, categoryId } = req.body;

    if (!Array.isArray(bookIds) || bookIds.length === 0) {
      return res.status(400).json({ message: "No books selected" });
    }

    if (!categoryId) {
      return res.status(400).json({ message: "Category is required" });
    }

    await Book.updateMany(
      { _id: { $in: bookIds } },
      { $set: { category: categoryId } }
    );

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Bulk Category Update", `Updated category for ${bookIds.length} books`, "book");
    }

    res.json({ message: `Successfully updated ${bookIds.length} books` });
  } catch (err: any) {
    console.error("Bulk update error:", err);
    res.status(500).json({ message: err.message || "Bulk update failed" });
  }
}



// ===================== GET PUBLIC STATS =====================
export async function getPublicStats(req: Request, res: Response) {
  try {
    const [totalBooks, totalUsers, activeBorrows] = await Promise.all([
      Book.countDocuments(),
      User.countDocuments(),
      BorrowedBook.countDocuments({ returned: false })
    ]);

    res.json({
      totalBooks,
      totalUsers,
      activeBorrows
    });
  } catch (err: any) {
    console.error("Stats Error:", err);
    res.status(500).json({ message: "Failed to fetch stats" });
  }
}
