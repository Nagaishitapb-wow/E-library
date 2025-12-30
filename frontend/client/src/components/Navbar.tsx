import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import NotificationDropdown from "./NotificationDropdown.tsx";
import "../styles/navbar.css";
import { logout, api } from "../api/auth";
import { useTheme } from "../context/ThemeContext";

export default function Navbar() {
    const navigate = useNavigate();
    const { theme, toggleTheme } = useTheme();
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
            <Link to="/" className="nav-logo">📚 BookHaven</Link>

            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                {isMenuOpen ? "✕" : "☰"}
            </button>

            <div className={`nav-container ${isMenuOpen ? "active" : ""}`}>
                <div className="nav-links">
                    {user?.role === "admin" ? (
                        <NavLink to="/admin" onClick={() => setIsMenuOpen(false)}>Admin Panel</NavLink>
                    ) : (
                        <>
                            <NavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</NavLink>
                            <NavLink to="/books" onClick={() => setIsMenuOpen(false)}>Browse Books</NavLink>

                            {user && (
                                <>
                                    <NavLink to="/dashboard" onClick={() => setIsMenuOpen(false)}>Dashboard</NavLink>
                                    <NavLink to="/wishlist" onClick={() => setIsMenuOpen(false)}>Wishlist</NavLink>
                                    <NavLink to="/borrowed" onClick={() => setIsMenuOpen(false)}>My Books</NavLink>
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

                    <button className="theme-toggle" onClick={toggleTheme}>
                        {theme === "light" ? "🌙" : "☀️"}
                    </button>

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
