import { Request, Response } from "express";
import { SupportTicket } from "../models/SupportTicket";

export async function submitTicket(req: Request, res: Response) {
    try {
        const { email, type, subject, description } = req.body;
        const userId = (req as any).user?.id; // If logged in

        if (!email || !type || !subject || !description) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const newTicket = new SupportTicket({
            user: userId || null,
            email,
            type,
            subject,
            description
        });

        await newTicket.save();

        res.status(201).json({
            message: type === "bug" ? "Bug report submitted successfully" : "Book request submitted successfully",
            ticket: newTicket
        });
    } catch (err: any) {
        console.error("Support Ticket Error:", err);
        res.status(500).json({ message: "Failed to submit request" });
    }
}

export async function getAllTickets(req: Request, res: Response) {
    try {
        const { type, status } = req.query;
        const filter: any = {};

        if (type && type !== "all") {
            filter.type = type;
        }
        if (status && status !== "all") {
            filter.status = status;
        }

        const tickets = await SupportTicket.find(filter)
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        res.json(tickets);
    } catch (err: any) {
        res.status(500).json({ message: "Failed to fetch tickets" });
    }
}

export async function updateTicketStatus(req: Request, res: Response) {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!["open", "in-progress", "resolved", "closed"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        const ticket = await SupportTicket.findByIdAndUpdate(id, { status }, { new: true });

        if (!ticket) {
            return res.status(404).json({ message: "Ticket not found" });
        }

        res.json({ message: `Ticket status updated to ${status}`, ticket });
    } catch (err: any) {
        res.status(500).json({ message: "Failed to update status" });
    }
}
