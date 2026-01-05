import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";

interface UserStats {
    _id: string;
    name: string;
    email: string;
    role: "user" | "admin";
    activeBorrows: number;
    totalFines: number;
    wishlistCount: number;
    createdAt: string;
}

interface PaginationInfo {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export default function AdminUserManager() {
    const [users, setUsers] = useState<UserStats[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState<PaginationInfo | null>(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const USERS_PER_PAGE = 25;

    useEffect(() => {
        fetchUsers();
    }, [currentPage]);

    // Search with debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (currentPage !== 1) setCurrentPage(1);
            else fetchUsers();
        }, 500);
        return () => clearTimeout(timer);
    }, [searchTerm]);

    const fetchUsers = async () => {
        try {
            setIsLoading(true);
            const res = await api.get(`/user?page=${currentPage}&limit=${USERS_PER_PAGE}${searchTerm ? `&search=${searchTerm}` : ""}`);
            setUsers(res.data.data || res.data);
            setPagination(res.data.pagination);
        } catch (error) {
            toast.error("Failed to load users");
        } finally {
            setIsLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <div>
            <div className="admin-header-row">
                <h2>User Management</h2>
            </div>

            <div className="admin-filters-row">
                <div className="admin-filter-group">
                    <label>Search Users</label>
                    <input
                        type="text"
                        className="admin-filter-input"
                        placeholder="Search name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
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
                        <th>Name</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Active Borrows</th>
                        <th>Total Fines</th>
                        <th>Wishlist Items</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map(user => (
                        <tr key={user._id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                                <span style={{
                                    padding: "4px 8px",
                                    borderRadius: "4px",
                                    background: user.role === "admin" ? "#fee2e2" : "#d1fae5",
                                    color: user.role === "admin" ? "#991b1b" : "#065f46",
                                    fontWeight: "bold",
                                    fontSize: "0.85rem"
                                }}>
                                    {user.role.toUpperCase()}
                                </span>
                            </td>
                            <td style={{ textAlign: "center" }}>{user.activeBorrows}</td>
                            <td style={{ color: user.totalFines > 0 ? "red" : "#374151" }}>
                                {user.totalFines > 0 ? `₹${user.totalFines}` : "₹0"}
                            </td>
                            <td style={{ textAlign: "center" }}>{user.wishlistCount}</td>
                        </tr>
                    ))}
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
                            ({pagination.total} total users)
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
