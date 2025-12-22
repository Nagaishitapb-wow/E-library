import mongoose from "mongoose";

const borrowSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  bookId: { type: mongoose.Schema.Types.ObjectId, ref: "Book", required: true },
  borrowDate: { type: Date, default: Date.now },
  dueDate: { type: Date, required: true },  // e.g. 14 days return period
  returned: { type: Boolean, default: false },
  returnRequested: { type: Boolean, default: false },
  returnDate: { type: Date },
  fineAmount: { type: Number, default: 0 }
});

export default mongoose.model("Borrow", borrowSchema);
