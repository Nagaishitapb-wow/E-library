import { useState } from "react";
import AdminCategoryManager from "../components/AdminCategoryManager.tsx";
import AdminBookManager from "../components/AdminBookManager.tsx";
import AdminBorrowManager from "../components/AdminBorrowManager.tsx";
import AdminUserManager from "../components/AdminUserManager.tsx";
import AdminActivityLogs from "../components/AdminActivityLogs.tsx";
import "../styles/adminDashboard.css";

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"books" | "categories" | "borrowing" | "users" | "logs">("books");

    return (
        <div className="admin-dashboard">
            <h1>Admin Dashboard</h1>

            <div className="admin-tabs">
                <button
                    className={activeTab === "books" ? "active" : ""}
                    onClick={() => setActiveTab("books")}
                >
                    Manage Books
                </button>
                <button
                    className={activeTab === "categories" ? "active" : ""}
                    onClick={() => setActiveTab("categories")}
                >
                    Manage Categories
                </button>
                <button
                    className={activeTab === "borrowing" ? "active" : ""}
                    onClick={() => setActiveTab("borrowing")}
                >
                    Borrowing
                </button>
                <button
                    className={activeTab === "users" ? "active" : ""}
                    onClick={() => setActiveTab("users")}
                >
                    Users
                </button>
                <button
                    className={activeTab === "logs" ? "active" : ""}
                    onClick={() => setActiveTab("logs")}
                >
                    Activity Logs
                </button>
            </div>

            <div className="admin-content">
                {activeTab === "books" && <AdminBookManager />}
                {activeTab === "categories" && <AdminCategoryManager />}
                {activeTab === "borrowing" && <AdminBorrowManager />}
                {activeTab === "users" && <AdminUserManager />}
                {activeTab === "logs" && <AdminActivityLogs />}
            </div>
        </div>
    );
}
