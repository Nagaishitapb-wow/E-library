import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown.tsx";
import "../styles/navbar.css";
import { logout, api } from "../api/auth";

export default function Navbar() {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user?.id]);

    const fetchUnreadCount = async () => {
        try {
            const res = await api.get("/notifications");
            const unread = res.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Notif count error", error);
        }
    };

    async function handleLogout() {
        try {
            await logout();
            localStorage.removeItem("user");
            navigate("/")
            window.location.reload();
        } catch (error) {
            console.error("Logout error", error);
            // Fallback clear local state even if server fails
            localStorage.removeItem("user");
            navigate("/")
            window.location.reload();
        }
    }

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">📚 E-Library</Link>

            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? "✕" : "☰"}
            </button>

            <div className={`nav-container ${isMenuOpen ? "active" : ""}`}>
                <div className="nav-links">
                    {user?.role === "admin" ? (
                        <Link to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</Link>
                    ) : (
                        <>
                            <Link to="/" onClick={() => setIsMenuOpen(false)}>Home</Link>
                            <Link to="/books" onClick={() => setIsMenuOpen(false)}>Browse Books</Link>

                            {user && (
                                <>
                                    <Link to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                                    <Link to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</Link>
                                    <Link to="/borrowed" onClick={() => setIsMenuOpen(false)}>My Books</Link>
                                </>
                            )}
                        </>
                    )}
                </div>

                <div className="nav-auth">
                    {user && (
                        <div className="nav-notif">
                            <button className="notif-btn" onClick={() => setShowNotif(!showNotif)}>
                                🔔 {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
                            </button>
                            {showNotif && (
                                <NotificationDropdown
                                    onClose={() => setShowNotif(false)}
                                    onUnreadChange={fetchUnreadCount}
                                />
                            )}
                        </div>
                    )}

                    {user ? (
                        <div className="user-menu">
                            <span className="user-name">Hello, {user.name}</span>
                            <button onClick={handleLogout} className="btn-logout">Logout</button>
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn-login" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="btn-signup" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
}
