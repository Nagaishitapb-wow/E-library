import { Schema, model, Document, Types } from "mongoose";

export interface IActivityLog extends Document {
    userId: Types.ObjectId;
    action: string;
    details: string;
    category: 'book' | 'category' | 'user' | 'borrow' | 'fine';
    timestamp: Date;
}

const ActivityLogSchema = new Schema<IActivityLog>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    action: { type: String, required: true },
    details: { type: String, required: true },
    category: {
        type: String,
        enum: ['book', 'category', 'user', 'borrow', 'fine'],
        required: true
    },
    timestamp: { type: Date, default: Date.now }
});

export const ActivityLog = model<IActivityLog>("ActivityLog", ActivityLogSchema);
