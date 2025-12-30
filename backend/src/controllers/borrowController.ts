import { Request, Response } from "express";
import Borrow from "../models/Borrow";
import { Book } from "../models/Book";
import { Notification } from "../models/Notification";
import { User } from "../models/User";

// ===================== BORROW BOOK =====================
export async function borrowBook(req: Request, res: Response) {
  try {
    const { bookId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Login required" });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // Check if user already has an active borrow for this book
    const existingBorrow = await Borrow.findOne({ userId, bookId, returned: false });
    if (existingBorrow) {
      return res.status(400).json({ message: "You have already borrowed this book" });
    }

    if (book.stock < 1) {
      return res.status(400).json({ message: "Book is out of stock" });
    }

    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 14);

    const borrow = await Borrow.create({
      bookId,
      userId,
      dueDate,
    });

    book.stock -= 1;
    if (book.stock === 0) {
      book.status = "issued";
    }
    await book.save();

    res.json({
      message: "Book issued successfully",
      borrow,
    });

  } catch (err) {
    res.status(500).json({ message: "Borrow failed" });
  }
}

// ===================== REQUEST RETURN =====================
export async function requestReturn(req: Request, res: Response) {
  try {
    const { borrowId } = req.params;
    const userId = req.user?._id;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const record = await Borrow.findOne({ _id: borrowId, userId, returned: false });
    if (!record) return res.status(404).json({ message: "Borrow record not found" });

    if (record.returnRequested) {
      return res.status(400).json({ message: "Return already requested" });
    }

    record.returnRequested = true;
    await record.save();

    // Notify Admins
    const admins = await User.find({ role: "admin" });
    const book = await Book.findById(record.bookId);
    const user = await User.findById(userId);

    const adminNotifications = admins.map((admin: any) => ({
      userId: admin._id,
      bookId: record.bookId,
      message: `🔔 Return Request: ${user?.name} wants to return "${book?.title}"`
    }));

    if (adminNotifications.length > 0) {
      await Notification.insertMany(adminNotifications);
    }

    res.json({ message: "Return request submitted to admin" });
  } catch (err) {
    res.status(500).json({ message: "Request failed" });
  }
}

// ===================== CONFIRM RETURN =====================
export async function confirmReturn(req: Request, res: Response) {
  try {
    const { borrowId } = req.params;

    const record = await Borrow.findById(borrowId);
    if (!record || record.returned) {
      return res.status(404).json({ message: "Active borrow record not found" });
    }

    record.returned = true;
    record.returnRequested = false;
    record.returnDate = new Date();

    // Calculate fine
    if (record.returnDate > record.dueDate) {
      const lateDays = Math.ceil(
        (record.returnDate.getTime() - record.dueDate.getTime()) /
        (1000 * 60 * 60 * 24)
      );
      record.fineAmount = lateDays * 10;
    }

    await record.save();

    const book = await Book.findById(record.bookId);
    if (book) {
      book.stock += 1;
      if (book.stock > 0) book.status = "available";
      await book.save();
    }

    // Notify User
    await Notification.create({
      userId: record.userId,
      bookId: record.bookId,
      message: `✅ Return confirmed for "${book?.title}". Fine: ₹${record.fineAmount}`
    });

    res.json({ message: "Return confirmed", fine: record.fineAmount });
  } catch (err) {
    res.status(500).json({ message: "Confirmation failed" });
  }
}

// ===================== GET USER BORROWED BOOKS =====================
export async function getUserBorrowedBooks(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const books = await Borrow.find({
      userId: req.user._id,
      returned: false,
    }).populate("bookId", "title author coverImage stock status");

    res.json(books);

  } catch (err) {
    res.status(500).json({ message: "Fetch failed" });
  }
}

export async function getAllBorrowedBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const skip = (page - 1) * limit;

    const [borrowed, total] = await Promise.all([
      Borrow.find()
        .populate("userId", "name email")
        .populate("bookId", "title")
        .sort({ borrowDate: -1 })
        .skip(skip)
        .limit(limit),
      Borrow.countDocuments()
    ]);

    res.json({
      data: borrowed,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: any) {
    console.error("Fetch all borrows error:", err);
    res.status(500).json({ message: "Failed to fetch borrowed books" });
  }
}

// ===================== PAY FINE =====================
export async function payFine(req: Request, res: Response) {
  try {
    const { borrowId } = req.params;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const record = await Borrow.findOne({ _id: borrowId, userId });

    if (!record) {
      return res.status(404).json({ message: "Borrow record not found" });
    }

    if (record.fineAmount <= 0) {
      return res.status(400).json({ message: "No fine to pay" });
    }

    // "Fake" payment logic: just clear the fine
    record.fineAmount = 0;
    await record.save();

    res.json({ message: "Fine paid successfully" });

  } catch (err) {
    console.error("Pay fine error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
}
