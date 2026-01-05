import mongoose, { Schema, Document } from "mongoose";

export interface ISupportTicket extends Document {
    user?: mongoose.Types.ObjectId;
    email: string;
    type: "bug" | "request";
    subject: string;
    description: string;
    status: "open" | "in-progress" | "resolved" | "closed";
    createdAt: Date;
}

const SupportTicketSchema: Schema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: false },
    email: { type: String, required: true },
    type: { type: String, enum: ["bug", "request"], required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    status: {
        type: String,
        enum: ["open", "in-progress", "resolved", "closed"],
        default: "open"
    }
}, { timestamps: true });

export const SupportTicket = mongoose.model<ISupportTicket>("SupportTicket", SupportTicketSchema);
