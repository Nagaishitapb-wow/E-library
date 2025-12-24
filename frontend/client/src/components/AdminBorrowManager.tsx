import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import { confirmReturn } from "../api/borrow";

interface BorrowRecord {
    _id: string;
    userId: { name: string; email: string };
    bookId: { title: string };
    borrowDate: string;
    dueDate: string;
    returned: boolean;
    returnRequested: boolean;
    returnDate?: string;
    fineAmount: number;
}

export default function AdminBorrowManager() {
    const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);

    useEffect(() => {
        fetchRecords();
    }, []);

    const fetchRecords = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await api.get("/borrow/all", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBorrowRecords(res.data);
        } catch (error) {
            toast.error("Failed to load borrow records");
        }
    };

    const handleConfirmReturn = async (borrowId: string) => {
        try {
            await confirmReturn(borrowId);
            toast.success("Return confirmed");
            fetchRecords(); // Refresh list
        } catch (error) {
            toast.error("Confirmation failed");
        }
    };

    const calculateStatus = (record: BorrowRecord) => {
        if (record.returned) return <span style={{ color: "green", fontWeight: "bold" }}>Returned</span>;
        const isOverdue = new Date(record.dueDate) < new Date();
        return isOverdue
            ? <span style={{ color: "red", fontWeight: "bold" }}>Overdue</span>
            : <span style={{ color: "#2563eb", fontWeight: "bold" }}>Active</span>;
    };

    return (
        <div>
            <h2>Borrow Monitoring</h2>
            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Book Title</th>
                        <th>Borrow Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Fine</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {borrowRecords.map(record => (
                        <tr key={record._id}>
                            <td>
                                <div style={{ fontWeight: "bold" }}>{record.userId?.name || "Unknown"}</div>
                                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{record.userId?.email}</div>
                            </td>
                            <td>{record.bookId?.title || "Deleted Book"}</td>
                            <td>{new Date(record.borrowDate).toLocaleDateString()}</td>
                            <td>{new Date(record.dueDate).toLocaleDateString()}</td>
                            <td>{calculateStatus(record)}</td>
                            <td>
                                {record.fineAmount > 0
                                    ? <span style={{ color: "red" }}>₹{record.fineAmount}</span>
                                    : "₹0"}
                            </td>
                            <td>
                                {!record.returned && record.returnRequested && (
                                    <button
                                        onClick={() => handleConfirmReturn(record._id)}
                                        style={{
                                            background: "#10b981",
                                            color: "white",
                                            border: "none",
                                            padding: "6px 12px",
                                            borderRadius: "4px",
                                            cursor: "pointer",
                                            fontSize: "0.85rem",
                                            fontWeight: "bold"
                                        }}
                                    >
                                        ✅ Confirm Return
                                    </button>
                                )}
                                {!record.returned && !record.returnRequested && (
                                    <span style={{ fontSize: "0.85rem", color: "#6b7280" }}>Active</span>
                                )}
                                {record.returned && (
                                    <span style={{ fontSize: "0.85rem", color: "#10b981" }}>Completed</span>
                                )}
                            </td>
                        </tr>
                    ))}
                    {borrowRecords.length === 0 && (
                        <tr>
                            <td colSpan={6} style={{ textAlign: "center", padding: "20px" }}>No borrow records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
