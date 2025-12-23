import mongoose from "mongoose";
import Borrow from "../models/Borrow";
import { User } from "../models/User";
import { connectDB } from "../config/db";
import dotenv from "dotenv";
import fs from "fs";

// Load env vars
dotenv.config();

async function run() {
    await connectDB();

    try {
        const borrows = await Borrow.find({ fineAmount: { $gt: 0 } })
            .populate("userId", "name email")
            .populate("bookId", "title");

        let output = "Users with Fines:\n";
        borrows.forEach(b => {
            const user = b.userId as any;
            const book = b.bookId as any;
            output += `User: ${user.name} (${user.email}) - Fine: ${b.fineAmount} - Book: ${book.title}\n`;
        });

        console.log(output);
        fs.writeFileSync("fines_report.txt", output);

    } catch (err) {
        console.error("Error checking fines:", err);
    } finally {
        await mongoose.connection.close();
        process.exit();
    }
}

run();
