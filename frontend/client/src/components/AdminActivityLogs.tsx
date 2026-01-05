import { useState, useEffect } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import "../styles/adminDashboard.css";

interface ActivityLog {
    _id: string;
    userId: {
        _id: string;
        name: string;
        email: string;
        role: string;
    };
    action: string;
    details: string;
    category: string;
    timestamp: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminActivityLogs() {
    const [logs, setLogs] = useState<ActivityLog[]>([]);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);

    const fetchLogs = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/activity?page=${currentPage}&limit=20`);
            setLogs(res.data.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error("Failed to load activity logs");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [currentPage]);

    const getCategoryColor = (category: string) => {
        switch (category) {
            case "book": return "#3b82f6";
            case "category": return "#10b981";
            case "borrow": return "#f59e0b";
            case "fine": return "#ef4444";
            case "user": return "#8b5cf6";
            default: return "#6b7280";
        }
    };

    return (
        <div className="activity-logs">
            <div className="admin-header-row">
                <h2>System Activity Logs</h2>
                <button className="add-btn" onClick={fetchLogs} disabled={isLoading}>
                    {isLoading ? "Refreshing..." : "Refresh Logs"}
                </button>
            </div>

            <table className="admin-table">
                <thead>
                    <tr>
                        <th>Timestamp</th>
                        <th>User</th>
                        <th>Action</th>
                        <th>Category</th>
                        <th>Details</th>
                    </tr>
                </thead>
                <tbody>
                    {logs.map(log => (
                        <tr key={log._id}>
                            <td style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
                                {new Date(log.timestamp).toLocaleString()}
                            </td>
                            <td>
                                <div style={{ fontWeight: "600" }}>{log.userId?.name || "System"}</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{log.userId?.email}</div>
                            </td>
                            <td>
                                <span style={{ fontWeight: "600" }}>{log.action}</span>
                            </td>
                            <td>
                                <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: `${getCategoryColor(log.category)}20`,
                                    color: getCategoryColor(log.category),
                                    fontSize: "0.75rem",
                                    fontWeight: "700",
                                    textTransform: "uppercase"
                                }}>
                                    {log.category}
                                </span>
                            </td>
                            <td style={{ maxWidth: "300px", fontSize: "0.9rem" }}>
                                {log.details}
                            </td>
                        </tr>
                    ))}
                    {logs.length === 0 && !isLoading && (
                        <tr>
                            <td colSpan={5} style={{ textAlign: "center", padding: "40px", color: "var(--text-muted)" }}>
                                No activity logs found.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            {pagination && pagination.totalPages > 1 && (
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "24px",
                    marginTop: "30px"
                }}>
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="btn secondary"
                    >
                        ← Previous
                    </button>
                    <span>Page {currentPage} of {pagination.totalPages}</span>
                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                        disabled={currentPage === pagination.totalPages}
                        className="btn secondary"
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}
