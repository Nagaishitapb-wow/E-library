import { Request, Response } from "express";
import { User } from "../models/User";
import Borrow from "../models/Borrow";
import { Wishlist } from "../models/Wishlist";

import bcrypt from "bcrypt";

// ===================== GET ALL USERS WITH STATS =====================
export async function getAllUsers(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            User.find().select("-passwordHash").skip(skip).limit(limit),
            User.countDocuments()
        ]);

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

        res.json({
            data: userStats,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        });
    } catch (err: any) {
        console.error("Get users error:", err);
        res.status(500).json({ message: "Failed to fetch users" });
    }
}

// ===================== GET CURRENT USER PROFILE =====================
export async function getUserProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).user?._id;
        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(userId).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "User not found" });

        // Statistics
        const [totalBorrowed, currentlyBorrowed, fines, wishlist] = await Promise.all([
            Borrow.countDocuments({ userId }),
            Borrow.countDocuments({ userId, returned: false }),
            Borrow.aggregate([
                { $match: { userId } },
                { $group: { _id: null, total: { $sum: "$fineAmount" } } },
            ]),
            Wishlist.countDocuments({ userId }),
        ]);

        res.json({
            user,
            statistics: {
                totalBorrowed,
                currentlyBorrowed,
                totalFines: fines[0]?.total || 0,
                wishlistCount: wishlist || 0,
            }
        });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Failed to fetch profile" });
    }
}

// ===================== UPDATE USER PROFILE =====================
export async function updateUserProfile(req: Request, res: Response) {
    try {
        const userId = (req as any).user?._id;
        const { name, email } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findByIdAndUpdate(userId, { name, email }, { new: true }).select("-passwordHash");
        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ message: "Profile updated", user });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Update failed" });
    }
}

// ===================== CHANGE PASSWORD =====================
export async function changePassword(req: Request, res: Response) {
    try {
        const userId = (req as any).user?._id;
        const { oldPassword, newPassword } = req.body;

        if (!userId) return res.status(401).json({ message: "Unauthorized" });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
        if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

        user.passwordHash = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.json({ message: "Password updated successfully" });
    } catch (err: any) {
        res.status(500).json({ message: err.message || "Password change failed" });
    }
}
