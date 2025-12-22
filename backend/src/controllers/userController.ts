import { Request, Response } from "express";
import { User } from "../models/User";
import Borrow from "../models/Borrow";
import { Wishlist } from "../models/Wishlist";

// ===================== GET ALL USERS WITH STATS =====================
export async function getAllUsers(req: Request, res: Response) {
    try {
        const users = await User.find().select("-passwordHash"); // Exclude passwords

        // Aggregate stats for each user (Parallelize for performance)
        const userStats = await Promise.all(
            users.map(async (user) => {
                const [borrowedCount, fines, wishlist] = await Promise.all([
                    Borrow.countDocuments({ userId: user._id, returned: false }),
                    Borrow.aggregate([
                        { $match: { userId: user._id } },
                        { $group: { _id: null, total: { $sum: "$fineAmount" } } },
                    ]),
                    Wishlist.countDocuments({ userId: user._id }),
                ]);

                return {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    createdAt: user.createdAt,
                    activeBorrows: borrowedCount,
                    totalFines: fines[0]?.total || 0,
                    wishlistCount: wishlist || 0,
                };
            })
        );

        res.json(userStats);
    } catch (err: any) {
        console.error("Get users error:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}
