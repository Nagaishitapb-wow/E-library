import { useEffect, useState } from "react";
import { getMyBorrowedBooks, requestReturn } from "../api/borrow";
import { toast } from "react-toastify";
import "../styles/borrowed.css";

interface BorrowedBook {
  _id: string;
  bookId: {
    _id: string;
    title: string;
    author: string;
    coverImage: string;
  };
  borrowDate: string;
  dueDate: string;
  returnDate: string;
  returnRequested: boolean;
  fineAmount: number;
}

export default function BorrowedBooks() {
  const [books, setBooks] = useState<BorrowedBook[]>([]);

  useEffect(() => {
    getMyBorrowedBooks().then(setBooks).catch(() => toast.error("Failed to load Borrowed Books"));
  }, []);

  async function handleReturnRequest(borrowId: string) {
    try {
      await requestReturn(borrowId);
      toast.success("Return request sent to admin!");
      setBooks(prev => prev.map(b => b._id === borrowId ? { ...b, returnRequested: true } : b));
    } catch {
      toast.error("Request failed");
    }
  }

  return (
    <div className="borrowed-container">
      <h1>📘 My Borrowed Books</h1>

      {books.length === 0 ? <p className="empty">No borrowed books yet…</p> : null}

      <div className="borrowed-grid">
        {books.map(b => (
          <div className="borrow-card" key={b._id}>
            <img src={b.bookId.coverImage} alt={b.bookId.title} />

            <h3>{b.bookId.title}</h3>
            <p className="author">by {b.bookId.author}</p>

            <p className="date">
              Borrowed: <b>{new Date(b.borrowDate).toLocaleDateString()}</b><br />
              Due: <b>{new Date(b.dueDate).toLocaleDateString()}</b>
            </p>

            {b.fineAmount > 0 && <p className="fine">Fine ₹{b.fineAmount}</p>}

            <button
              className={`return-btn ${b.returnRequested ? "pending" : ""}`}
              onClick={() => !b.returnRequested && handleReturnRequest(b._id)}
              disabled={b.returnRequested}
            >
              {b.returnRequested ? "⏳ Return Pending" : "🔙 Request Return"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
