import { Schema, model, Document, Types } from "mongoose";

export interface INotification extends Document {
    userId: Types.ObjectId;
    bookId: Types.ObjectId;
    message: string;
    isRead: boolean;
    createdAt: Date;
}

const NotificationSchema = new Schema<INotification>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    bookId: { type: Schema.Types.ObjectId, ref: "Book", required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export const Notification = model<INotification>("Notification", NotificationSchema);
