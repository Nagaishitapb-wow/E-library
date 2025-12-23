import mongoose from "mongoose";
import Borrow from "../models/Borrow";
import { User } from "../models/User";
import { Book } from "../models/Book";
import { connectDB } from "../config/db";
import dotenv from "dotenv";
import fs from "fs";

// Load env vars
dotenv.config();

async function run() {
    await connectDB();

    try {
        // Find a borrow that is not returned
        let borrow = await Borrow.findOne({ returned: false }).populate("userId").populate("bookId");

        if (!borrow) {
            console.log("⚠️ No active borrowed books found. Creating a new borrow record...");

            const user = await User.findOne();
            const book = await Book.findOne({ stock: { $gt: 0 } });

            if (!user || !book) {
                console.log("❌ Cannot create borrow: No users or books available.");
                return;
            }

            borrow = await Borrow.create({
                userId: user._id,
                bookId: book._id,
                borrowDate: new Date(),
                dueDate: new Date(),
                returned: false
            });
            console.log("✅ Created new borrow record.");
        }

        // Set a fine
        borrow.fineAmount = 50;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        borrow.dueDate = yesterday;

        await borrow.save();

        // Re-fetch to get populated fields if we just created it
        const populatedBorrow = await Borrow.findById(borrow._id).populate("userId").populate("bookId");

        if (!populatedBorrow) return;

        const user = populatedBorrow.userId as any;
        const book = populatedBorrow.bookId as any;

        const report = `User: ${user.name} (${user.email}) - Book: ${book.title} - Fine: 50`;
        console.log(`✅ Success! ${report}`);

        // Write to report file immediately so we can read it
        fs.writeFileSync("fines_report.txt", report);

    } catch (err) {
        console.error("❌ Error simulating fine:", err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

run();
