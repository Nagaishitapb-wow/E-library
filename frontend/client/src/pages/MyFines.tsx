import { useEffect, useState } from "react";
import { getMyBorrowedBooks, payFine } from "../api/borrow";
import { toast } from "react-toastify";
import PaymentModal, { type PaymentDetails } from "../components/PaymentModal";
import "../styles/borrowed.css"; // Reusing borrowed books styles for consistency

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

const PLACEHOLDER_IMAGE = "https://via.placeholder.com/400x600?text=No+Cover+Available";

export default function MyFines() {
    const [fines, setFines] = useState<BorrowedBook[]>([]);
    const [selectedFineBook, setSelectedFineBook] = useState<BorrowedBook | null>(null);

    useEffect(() => {
        loadFines();
    }, []);

    function loadFines() {
        getMyBorrowedBooks()
            .then(books => {
                const withFines = books.filter((b: BorrowedBook) => b.fineAmount > 0);
                setFines(withFines);
            })
            .catch(() => toast.error("Failed to load fines"));
    }

    async function handlePayFine(_details: PaymentDetails) {
        if (!selectedFineBook) return;

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        try {
            await payFine(selectedFineBook._id);
            toast.success("Fine paid successfully!");

            // Remove paid fine from list
            setFines(prev => prev.filter(b => b._id !== selectedFineBook._id));
            setSelectedFineBook(null);
        } catch {
            toast.error("Payment failed");
        }
    }

    const totalFine = fines.reduce((sum, b) => sum + b.fineAmount, 0);

    return (
        <div className="borrowed-container">
            <h1>My Fines</h1>

            <div className="fine-summary" style={{
                background: "#ffebee",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "2rem",
                border: "1px solid #ef5350",
                color: "#c62828"
            }}>
                <h2>Total Pending Fines: ₹{totalFine}</h2>
                {fines.length === 0 && <p style={{ color: "green" }}>🎉 No pending fines!</p>}
            </div>

            <div className="borrowed-grid">
                {fines.map(b => (
                    <div className="borrow-card" key={b._id} style={{ borderColor: "#ef5350" }}>
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
                            Due: <b>{new Date(b.dueDate).toLocaleDateString()}</b>
                        </p>

                        <div className="fine-section">
                            <p className="fine" style={{ fontSize: "1.2rem" }}>Fine: ₹{b.fineAmount}</p>
                            <button
                                className="pay-fine-btn"
                                onClick={() => setSelectedFineBook(b)}
                            >
                                Pay Now
                            </button>
                        </div>
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
