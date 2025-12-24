import { useEffect, useState } from "react";
import { getMyBorrowedBooks, requestReturn, payFine } from "../api/borrow";
import { toast } from "react-toastify";
import PaymentModal, { type PaymentDetails } from "../components/PaymentModal";
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

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

export default function BorrowedBooks() {
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [selectedFineBook, setSelectedFineBook] = useState<BorrowedBook | null>(null);

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

  async function handlePayFine(_details: PaymentDetails) {
    if (!selectedFineBook) return;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await payFine(selectedFineBook._id);
      toast.success("Fine paid successfully!");
      setBooks(prev => prev.map(b => b._id === selectedFineBook._id ? { ...b, fineAmount: 0 } : b));
      setSelectedFineBook(null);
    } catch {
      toast.error("Payment failed");
    }
  }

  return (
    <div className="borrowed-container">
      <h1>📘 My Borrowed Books</h1>

      {books.length === 0 ? <p className="empty">No borrowed books yet…</p> : null}

      <div className="borrowed-grid">
        {books.map(b => (
          <div className="borrow-card" key={b._id}>
            <img
              src={b.bookId.coverImage || PLACEHOLDER_IMAGE}
              alt={b.bookId.title}
              onError={(e) => {
                (e.target as HTMLImageElement).src = PLACEHOLDER_IMAGE;
              }}
            />

            <h3>{b.bookId.title}</h3>
            <p className="author">by {b.bookId.author}</p>

            <p className="date">
              Borrowed: <b>{new Date(b.borrowDate).toLocaleDateString()}</b><br />
              Due: <b>{new Date(b.dueDate).toLocaleDateString()}</b>
            </p>

            {b.fineAmount > 0 && (
              <div className="fine-section">
                <p className="fine">Fine: ₹{b.fineAmount}</p>
                <button
                  className="pay-fine-btn"
                  onClick={() => setSelectedFineBook(b)}
                >
                  Pay Fine
                </button>
              </div>
            )}

            <button
              className={`return-btn ${b.returnRequested ? "pending" : ""}`}
              onClick={() => !b.returnRequested && handleReturnRequest(b._id)}
              disabled={b.returnRequested || b.fineAmount > 0}
            >
              {b.returnRequested ? "⏳ Return Pending" : "🔙 Request Return"}
            </button>
          </div>
        ))}
      </div>

      {selectedFineBook && (
        <PaymentModal
          isOpen={true}
          onClose={() => setSelectedFineBook(null)}
          onPay={handlePayFine}
          amount={selectedFineBook.fineAmount}
        />
      )}
    </div>
  );
}
