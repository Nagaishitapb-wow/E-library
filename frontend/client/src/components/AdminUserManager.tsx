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

export default function AdminUserManager() {
    const [users, setUsers] = useState<UserStats[]>([]);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const res = await api.get("/user");
            setUsers(res.data);
        } catch (error) {
            toast.error("Failed to load users");
        }
    };

    return (
        <div>
            <h2>User Management</h2>
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
        </div>
    );
}
