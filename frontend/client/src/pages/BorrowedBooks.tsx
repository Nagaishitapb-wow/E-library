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
  isFinePaid: boolean;
}

const PLACEHOLDER_IMAGE = "https://placehold.co/400x600?text=No+Cover+Available";

import { useNavigate } from "react-router-dom";

export default function BorrowedBooks() {
  const [books, setBooks] = useState<BorrowedBook[]>([]);
  const [selectedFineBook, setSelectedFineBook] = useState<BorrowedBook | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    getMyBorrowedBooks().then(setBooks).catch(() => toast.error("Failed to load Borrowed Books"));
  }, []);

  async function handleReturnRequest(book: BorrowedBook) {
    // Check for overdue & unpaid fine
    const now = new Date();
    const dueDate = new Date(book.dueDate);
    const isOverdue = now > dueDate;

    // We need to verify if there's a fine to pay. 
    // If backend hasn't calculated 'fineAmount' yet (it's 0 until paid/returned generally, or we calc on fly), we calc here.
    // If checking 'fineAmount' from DB is not reliable for active books, we use logic.
    // Logic: If overdue AND !isFinePaid -> Redirect.
    if (isOverdue && !book.isFinePaid) {
      // Calculate days to be sure it's actually fine-able (grace period?) - assuming strict > dueDate
      const lateTime = now.getTime() - dueDate.getTime();
      const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));

      if (lateDays > 0) {
        toast.warning("Book is overdue! Please pay the fine to return.");
        // Assuming we have useNavigate hook, which we need to add.
        // window.location.href = `/fine/${book._id}`; // or use navigate
        // Let's use useNavigate.
        navigate(`/fine/${book._id}`);
        return; // We'll handle navigation via hook in component body
      }
    }

    const confirmReturn = window.confirm("Are you sure you want to return this book?");
    if (!confirmReturn) return;

    try {
      await requestReturn(book._id);
      toast.success("Return request sent to admin!");
      setBooks(prev => prev.map(b => b._id === book._id ? { ...b, returnRequested: true } : b));
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
      setBooks(prev => prev.map(b => b._id === selectedFineBook._id ? { ...b, isFinePaid: true } : b));
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

            {b.fineAmount > 0 && !b.isFinePaid && (
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

            {b.isFinePaid && b.fineAmount > 0 && (
              <div className="fine-section" style={{ background: "rgba(34, 197, 94, 0.1)", borderColor: "rgba(34, 197, 94, 0.2)" }}>
                <p className="fine" style={{ color: "#22c55e", margin: 0 }}>✓ Fine Paid</p>
              </div>
            )}

            <button
              className={`return-btn ${b.returnRequested ? "pending" : ""}`}
              onClick={() => !b.returnRequested && handleReturnRequest(b)}
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
