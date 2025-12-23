import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";

interface Notification {
    _id: string;
    message: string;
    isRead: boolean;
    createdAt: string;
}

interface Props {
    onClose: () => void;
    onUnreadChange: () => void;
}

export default function NotificationDropdown({ onClose, onUnreadChange }: Props) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get("https://e-library-jtx2.onrender.com/api/notifications", {
                withCredentials: true
            });
            setNotifications(res.data);
        } catch (error) {
            console.error("Fetch notifications error", error);
        } finally {
            setLoading(false);
        }
    };

    const markAsRead = async (id: string) => {
        try {
            await api.put(`https://e-library-jtx2.onrender.com/api/notifications/${id}/read`, {}, {
                withCredentials: true
            });
            setNotifications(notifications.map((n: Notification) => n._id === id ? { ...n, isRead: true } : n));
            onUnreadChange();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const markAllRead = async () => {
        try {
            await api.put(`https://e-library-jtx2.onrender.com/api/notifications/all-read`, {}, {
                withCredentials: true
            });
            setNotifications(notifications.map((n: Notification) => ({ ...n, isRead: true })));
            onUnreadChange();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    return (
        <div className="notification-dropdown">
            <div className="dropdown-header">
                <h3>Notifications</h3>
                <button onClick={markAllRead} className="mark-all-btn">Mark all read</button>
            </div>
            <div className="notifications-list">
                {loading ? <p>Loading...</p> : notifications.length === 0 ? <p className="no-notif">No notifications</p> : (
                    (notifications as Notification[]).map((n: Notification) => (
                        <div
                            key={n._id}
                            className={`notification-item ${n.isRead ? "read" : "unread"}`}
                            onClick={() => !n.isRead && markAsRead(n._id)}
                        >
                            <p>{n.message}</p>
                            <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                    ))
                )}
            </div>
            <button className="close-btn" onClick={onClose}>Close</button>
        </div>
    );
}
