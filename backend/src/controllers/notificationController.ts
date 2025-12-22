import { Request, Response } from "express";
import { Notification } from "../models/Notification";

export async function getNotifications(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        const notifications = await Notification.find({ userId }).sort({ createdAt: -1 }).limit(20);
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch notifications" });
    }
}

export async function markAsRead(req: Request, res: Response) {
    try {
        const { id } = req.params;
        await Notification.findByIdAndUpdate(id, { isRead: true });
        res.json({ message: "Notification marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update notification" });
    }
}

export async function markAllAsRead(req: Request, res: Response) {
    try {
        const userId = (req as any).user.id;
        await Notification.updateMany({ userId, isRead: false }, { isRead: true });
        res.json({ message: "All notifications marked as read" });
    } catch (err) {
        res.status(500).json({ message: "Failed to update notifications" });
    }
}
