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
    isFinePaid: boolean;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminBorrowManager() {
    const [borrowRecords, setBorrowRecords] = useState<BorrowRecord[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [fineFilter, setFineFilter] = useState("all");
    const [isLoading, setIsLoading] = useState(false);

    const RECORDS_PER_PAGE = 30;

    useEffect(() => {
        fetchRecords();
    }, [currentPage, statusFilter, fineFilter]);

    // Use a separate effect for search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchRecords();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchRecords = async () => {
        try {
            setIsLoading(true);
            let url = `/borrow/all?page=${currentPage}&limit=${RECORDS_PER_PAGE}`;
            if (searchTerm) url += `&search=${searchTerm}`;
            if (statusFilter !== "all") url += `&status=${statusFilter}`;
            if (fineFilter !== "all") url += `&hasFine=${fineFilter === "hasFine"}`;

            const res = await api.get(url);
            setBorrowRecords(res.data.data || res.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error("Failed to load borrow records");
        } finally {
            setIsLoading(false);
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

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const calculateFine = (record: BorrowRecord) => {
        if (record.returned) return record.fineAmount;

        const dueDate = new Date(record.dueDate);
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

    return (
        <div>
            <div className="admin-header-row">
                <h2>Borrow Monitoring</h2>
            </div>

            <div className="admin-filters-row">
                <div className="admin-filter-group">
                    <label>Search Users or Books</label>
                    <input
                        type="text"
                        className="admin-filter-input"
                        placeholder="Search name, email or title..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="admin-filter-group fixed">
                    <label>Status</label>
                    <select
                        className="admin-filter-select"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="overdue">Overdue</option>
                        <option value="returned">Returned</option>
                    </select>
                </div>
                <div className="admin-filter-group fixed">
                    <label>Fines</label>
                    <select
                        className="admin-filter-select"
                        value={fineFilter}
                        onChange={(e) => setFineFilter(e.target.value)}
                    >
                        <option value="all">All Records</option>
                        <option value="hasFine">Has Fines</option>
                        <option value="noFine">No Fines</option>
                    </select>
                </div>
                <div style={{ display: "flex", alignItems: "flex-end" }}>
                    <button
                        className="admin-filter-reset"
                        onClick={() => { setSearchTerm(""); setStatusFilter("all"); setFineFilter("all"); }}
                    >
                        Reset Filters
                    </button>
                </div>
            </div>

            {isLoading && (
                <div style={{ textAlign: "center", padding: "10px", color: "var(--primary)", fontWeight: "600" }}>
                    Updating search results...
                </div>
            )}

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>User</th>
                        <th>Book Title</th>
                        <th>Borrow Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                        <th>Fine</th>
                        <th>Payment</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {borrowRecords.map(record => {
                        const fine = calculateFine(record);
                        return (
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
                                    {fine > 0
                                        ? <span style={{ color: "red" }}>₹{fine}</span>
                                        : "₹0"}
                                </td>
                                <td>
                                    {record.isFinePaid ? (
                                        <span style={{ color: "green", fontWeight: "bold" }}>Paid</span>
                                    ) : (
                                        fine > 0 ? <span style={{ color: "red", fontWeight: "bold" }}>Pending</span> : "-"
                                    )}
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
                        );
                    })}
                    {borrowRecords.length === 0 && (
                        <tr>
                            <td colSpan={8} style={{ textAlign: "center", padding: "20px" }}>No borrow records found.</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {/* Pagination Controls */}
            {pagination && pagination.totalPages > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: "30px",
                    padding: "20px",
                    background: "var(--card)",
                    borderRadius: "12px",
                    border: "1px solid var(--border)"
                }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: "10px 20px",
                            background: currentPage === 1 ? "var(--bg-soft)" : "var(--primary)",
                            color: currentPage === 1 ? "var(--text-muted)" : "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: currentPage === 1 ? "not-allowed" : "pointer",
                            opacity: currentPage === 1 ? 0.5 : 1
                        }}
                    >
                        ← Previous
                    </button>

                    <div style={{
                        fontSize: "1rem",
                        fontWeight: "600",
                        color: "var(--text-main)",
                        textAlign: "center"
                    }}>
                        Page {currentPage} of {pagination.totalPages}
                        <div style={{
                            fontSize: "0.85rem",
                            color: "var(--text-muted)",
                            fontWeight: "500",
                            marginTop: "4px"
                        }}>
                            ({pagination.total} total records)
                        </div>
                    </div>

                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        style={{
                            padding: "10px 20px",
                            background: currentPage === pagination.totalPages ? "var(--bg-soft)" : "var(--primary)",
                            color: currentPage === pagination.totalPages ? "var(--text-muted)" : "white",
                            border: "none",
                            borderRadius: "8px",
                            fontWeight: "600",
                            cursor: currentPage === pagination.totalPages ? "not-allowed" : "pointer",
                            opacity: currentPage === pagination.totalPages ? 0.5 : 1
                        }}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
