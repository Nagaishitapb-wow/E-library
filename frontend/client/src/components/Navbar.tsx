import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import NotificationDropdown from "./NotificationDropdown.tsx";
import "../styles/navbar.css";

export default function Navbar() {
    const navigate = useNavigate();
    const [showNotif, setShowNotif] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    const userJson = localStorage.getItem("user");
    const user = userJson ? JSON.parse(userJson) : null;

    useEffect(() => {
        if (user) {
            fetchUnreadCount();
        }
    }, [user?.id]);

    const fetchUnreadCount = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get("http://localhost:4000/api/notifications", {
                headers: { Authorization: `Bearer ${token}` }
            });
            const unread = res.data.filter((n: any) => !n.isRead).length;
            setUnreadCount(unread);
        } catch (error) {
            console.error("Notif count error", error);
        }
    };

    function handleLogout() {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        navigate("/")
        window.location.reload();
    }

    return (
        <nav className="navbar">
            <Link to="/" className="nav-logo">📚 E-Library</Link>

            <div className="nav-links">
                {user?.role === "admin" ? (
                    <Link to="/admin">Admin Panel</Link>
                ) : (
                    <>
                        <Link to="/">Home</Link>
                        <Link to="/books">Browse Books</Link>

                        {user && (
                            <>
                                <Link to="/dashboard">Dashboard</Link>
                                <Link to="/wishlist">Wishlist</Link>
                                <Link to="/borrowed">My Books</Link>
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
                        <Link to="/login" className="btn-login">Login</Link>
                        <Link to="/signup" className="btn-signup">Sign Up</Link>
                    </div>
                )}
            </div>
        </nav>
    );
}
