import { Request, Response } from "express";
import Borrow from "../models/Borrow";
import { Book } from "../models/Book";
import { Notification } from "../models/Notification";
import { User } from "../models/User";
import { logActivity } from "./activityController";

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

    // Log Activity
    await logActivity(userId, "Book Borrowed", `Borrowed book "${book.title}"`, "borrow");

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

    // Check for overdue & unpaid fine
    const now = new Date();
    if (now > record.dueDate && !record.isFinePaid) {
      // Double check it's actually fine-able (more than 0 days late)
      const lateTime = now.getTime() - record.dueDate.getTime();
      const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
      if (lateDays > 0) {
        return res.status(400).json({ message: "Cannot return overdue book. Please pay the fine first." });
      }
    }

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

    // Log Activity
    await logActivity(userId, "Return Requested", `Requested return for borrow record: ${record._id}`, "borrow");

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

    // Calculate fine: Flat 50 for first overdue day + 5 for each subsequent day
    if (record.returnDate > record.dueDate) {
      const lateTime = record.returnDate.getTime() - record.dueDate.getTime();
      const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));

      if (lateDays > 0) {
        record.fineAmount = 50 + ((lateDays - 1) * 5);
      }
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

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Return Confirmed", `Confirmed return for borrow record: ${borrowId}`, "borrow");
    }

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
    }).populate("bookId", "title author coverImage stock status").lean();

    // Calculate dynamic fine for active books
    const booksWithFines = books.map((b: any) => {
      try {
        if (!b.isFinePaid && b.dueDate) {
          const now = new Date();
          const dueDate = new Date(b.dueDate);
          if (!isNaN(dueDate.getTime()) && now > dueDate) {
            const lateTime = now.getTime() - dueDate.getTime();
            const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
            if (lateDays > 0) {
              b.fineAmount = 50 + ((lateDays - 1) * 5);
            }
          }
        }
      } catch (e) {
        console.error("Error calculating fine for book:", b._id, e);
      }
      return b;
    });

    res.json(booksWithFines);

  } catch (err) {
    console.error("Error in getUserBorrowedBooks:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
}

export async function getAllBorrowedBooks(req: Request, res: Response) {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const { search, status, hasFine } = req.query;
    const skip = (page - 1) * limit;

    let query: any = {};
    const conditions: any[] = [];

    // Status Filter
    if (status === "returned") {
      conditions.push({ returned: true });
    } else if (status === "active") {
      conditions.push({ returned: false, dueDate: { $gte: new Date() } });
    } else if (status === "overdue") {
      conditions.push({ returned: false, dueDate: { $lt: new Date() } });
    }

    // Fine Filter
    if (hasFine === "true") {
      conditions.push({
        $or: [
          { fineAmount: { $gt: 0 }, isFinePaid: false },
          { returned: false, dueDate: { $lt: new Date() } }
        ]
      });
    } else if (hasFine === "false") {
      conditions.push({
        $nor: [
          { fineAmount: { $gt: 0 }, isFinePaid: false },
          { returned: false, dueDate: { $lt: new Date() } }
        ]
      });
    }

    // Search logic
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      const [matchingUsers, matchingBooks] = await Promise.all([
        User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).select("_id"),
        Book.find({ title: searchRegex }).select("_id")
      ]);

      conditions.push({
        $or: [
          { userId: { $in: matchingUsers.map(u => u._id) } },
          { bookId: { $in: matchingBooks.map(b => b._id) } }
        ]
      });
    }

    if (conditions.length > 0) {
      query = conditions.length === 1 ? conditions[0] : { $and: conditions };
    }

    const [borrowed, total] = await Promise.all([
      Borrow.find(query)
        .populate("userId", "name email")
        .populate("bookId", "title")
        .sort({ borrowDate: -1 })
        .skip(skip)
        .limit(limit),
      Borrow.countDocuments(query)
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

    // Calculate current fine before payment to ensure accurate record
    if (record.returnDate && record.returnDate > record.dueDate) {
      // Already returned, fine is fixed
    } else {
      // Active borrow, calculate fine up to now
      const now = new Date();
      if (now > record.dueDate) {
        const lateTime = now.getTime() - record.dueDate.getTime();
        const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
        if (lateDays > 0) {
          record.fineAmount = 50 + ((lateDays - 1) * 5);
        }
      }
    }

    if (record.fineAmount <= 0) {
      return res.status(400).json({ message: "No fine to pay" });
    }

    record.isFinePaid = true;
    await record.save();

    // Log Activity
    if (req.user?._id) {
      await logActivity(req.user._id, "Fine Paid", `Paid fine of ₹${record.fineAmount} for borrow record: ${borrowId}`, "fine");
    }

    res.json({ message: "Fine paid successfully", fineAmount: record.fineAmount });

  } catch (err) {
    console.error("Pay fine error:", err);
    res.status(500).json({ message: "Payment failed" });
  }
}

// ===================== GET USER PENDING FINES =====================
export async function getUserFines(req: Request, res: Response) {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const unpaidBorrows = await Borrow.find({
      userId: req.user._id,
      isFinePaid: { $ne: true }
    }).populate("bookId", "title author coverImage").lean();

    const now = new Date();
    const withCalculatedFines = unpaidBorrows.map((b: any) => {
      // If book not returned, we calculate dynamic fine if overdue
      if (!b.returned) {
        const dueDate = new Date(b.dueDate);
        if (now > dueDate) {
          const lateTime = now.getTime() - dueDate.getTime();
          const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
          if (lateDays > 0) {
            b.fineAmount = 50 + ((lateDays - 1) * 5);
          }
        }
      }
      return b;
    }).filter((b: any) => b.fineAmount > 0);

    res.json(withCalculatedFines);
  } catch (err) {
    console.error("Error in getUserFines:", err);
    res.status(500).json({ message: "Fetch failed" });
  }
}

