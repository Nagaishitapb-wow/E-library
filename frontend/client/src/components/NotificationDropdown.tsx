import { useEffect, useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import Loader from "./Loader";

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
            const res = await api.get("/notifications", {
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
            await api.put(`/notifications/${id}/read`);
            setNotifications(notifications.map((n: Notification) => n._id === id ? { ...n, isRead: true } : n));
            onUnreadChange();
        } catch (error) {
            toast.error("Action failed");
        }
    };

    const markAllRead = async () => {
        try {
            await api.put("/notifications/all-read");
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
                {loading ? (
                    <div style={{ padding: "30px", display: "flex", justifyContent: "center" }}>
                        <Loader size="small" message="Fetching alerts..." />
                    </div>
                ) : notifications.length === 0 ? (
                    <p className="no-notif">No notifications</p>
                ) : (
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
