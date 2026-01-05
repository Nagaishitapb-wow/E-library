import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyBorrowedBooks, payFine } from "../api/borrow";
import { toast } from "react-toastify";
import "../styles/borrowed.css";

interface BorrowDetails {
    _id: string;
    bookId: {
        title: string;
        coverImage: string;
        author: string;
    };
    dueDate: string;
    returned: boolean;
    fineAmount: number;
    isFinePaid: boolean;
}

export default function FinePayment() {
    const { borrowId } = useParams();
    const navigate = useNavigate();
    const [borrow, setBorrow] = useState<BorrowDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!borrowId) return;
        fetchBorrowDetails();
    }, [borrowId]);

    const fetchBorrowDetails = async () => {
        try {
            const books = await getMyBorrowedBooks();
            const found = books.find((b: BorrowDetails) => b._id === borrowId);
            if (found) {
                setBorrow(found);
            } else {
                toast.error("Borrow record not found");
                navigate("/borrowed");
            }
        } catch (error) {
            toast.error("Failed to load details");
            navigate("/borrowed");
        } finally {
            setLoading(false);
        }
    };

    const calculateFine = (b: BorrowDetails) => {
        // Same logic as backend/admin
        if (b.isFinePaid) return 0; // Already paid
        // If backend stored it, use it? Backend stores 0 until confirmed return OR paid.
        // So we probably need to calc it.
        const dueDate = new Date(b.dueDate);
        const now = new Date();
        if (now > dueDate) {
            const lateTime = now.getTime() - dueDate.getTime();
            const lateDays = Math.ceil(lateTime / (1000 * 60 * 60 * 24));
            if (lateDays > 0) {
                return 50 + ((lateDays - 1) * 5);
            }
        }
        return 0;
    };

    const handlePay = async () => {
        if (!borrowId) return;
        try {
            await payFine(borrowId); // Using existing payFine endpoint
            toast.success("Fine paid successfully! You can now return the book.");
            navigate("/borrowed");
        } catch (error) {
            toast.error("Payment failed. Please try again.");
        }
    };

    if (loading) return <div className="p-10 text-center">Loading...</div>;
    if (!borrow) return null;

    const estimatedFine = calculateFine(borrow);

    return (
        <div className="borrowed-container" style={{ maxWidth: "600px", margin: "40px auto" }}>
            <h1>⚠️ Overdue Fine Payment</h1>
            <div className="borrow-card" style={{ width: "100%", cursor: "default", transform: "none" }}>
                <img
                    src={borrow.bookId.coverImage || "https://placehold.co/400x600"}
                    alt={borrow.bookId.title}
                    style={{ height: "300px", objectFit: "cover", width: "100%" }}
                />
                <div style={{ padding: "20px" }}>
                    <h2>{borrow.bookId.title}</h2>
                    <p className="author">by {borrow.bookId.author}</p>
                    <hr style={{ margin: "15px 0", borderColor: "var(--border)" }} />
                    <p style={{ color: "red", fontWeight: "bold", fontSize: "1.2rem" }}>
                        Book is Overdue!
                    </p>
                    <p>Due Date: {new Date(borrow.dueDate).toLocaleDateString()}</p>

                    <div style={{
                        background: "var(--bg-soft)",
                        padding: "15px",
                        borderRadius: "8px",
                        marginTop: "20px",
                        textAlign: "center"
                    }}>
                        <p style={{ margin: 0, fontSize: "0.9rem" }}>Outstanding Fine</p>
                        <p style={{ margin: "5px 0", fontSize: "2rem", fontWeight: "bold", color: "var(--primary)" }}>
                            ₹{estimatedFine}
                        </p>
                    </div>

                    <button
                        onClick={handlePay}
                        style={{
                            width: "100%",
                            padding: "12px",
                            marginTop: "20px",
                            background: "#10b981",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "1.1rem",
                            fontWeight: "bold",
                            cursor: "pointer"
                        }}
                    >
                        💸 Pay ₹{estimatedFine} Now
                    </button>

                    <button
                        onClick={() => navigate("/borrowed")}
                        style={{
                            width: "100%",
                            padding: "10px",
                            marginTop: "10px",
                            background: "transparent",
                            color: "var(--text-muted)",
                            border: "1px solid var(--border)",
                            borderRadius: "8px",
                            cursor: "pointer"
                        }}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}
