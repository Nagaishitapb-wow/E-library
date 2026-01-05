import { Request, Response } from "express";
import { ActivityLog } from "../models/ActivityLog";
import { Types } from "mongoose";

// Utility function to log an activity
export async function logActivity(userId: Types.ObjectId | string, action: string, details: string, category: 'book' | 'category' | 'user' | 'borrow' | 'fine') {
    try {
        const log = new ActivityLog({
            userId,
            action,
            details,
            category
        });
        await log.save();
    } catch (err) {
        console.error("Failed to save activity log:", err);
    }
}

// Fetch logs for admin panel
export async function getLogs(req: Request, res: Response) {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 50;
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            ActivityLog.find()
                .populate("userId", "name email role")
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit),
            ActivityLog.countDocuments()
        ]);

        res.json({
            data: logs,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        console.error("Error fetching activity logs:", err);
        res.status(500).json({ message: "Failed to fetch logs" });
    }
}
