import React, { useEffect, useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";
import Loader from "./Loader";

interface Ticket {
    _id: string;
    email: string;
    type: "bug" | "request";
    subject: string;
    description: string;
    status: string;
    createdAt: string;
    user?: {
        name: string;
    };
}

const AdminSupportManager: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterType, setFilterType] = useState("all");
    const [filterStatus, setFilterStatus] = useState("all");

    useEffect(() => {
        fetchTickets();
    }, [filterType, filterStatus]);

    const fetchTickets = async () => {
        try {
            const res = await api.get(`/support/tickets?type=${filterType}&status=${filterStatus}`);
            setTickets(res.data);
        } catch (error) {
            toast.error("Failed to fetch support tickets");
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (id: string, newStatus: string) => {
        try {
            await api.patch(`/support/tickets/${id}/status`, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`);
            fetchTickets(); // Refresh list
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    if (loading && tickets.length === 0) return <Loader fullPage message="Retrieving support tickets..." />;

    return (
        <div className="admin-support">
            <div className="admin-header-row">
                <h2>Support Tickets & Requests</h2>
            </div>

            <div className="admin-filters-row">
                <div className="admin-filter-group fixed">
                    <label>Filter Type</label>
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="admin-filter-select"
                    >
                        <option value="all">All Types</option>
                        <option value="bug">🐞 Bugs Only</option>
                        <option value="request">📚 Requests Only</option>
                    </select>
                </div>
                <div className="admin-filter-group fixed">
                    <label>Filter Status</label>
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="admin-filter-select"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Type</th>
                            <th>Subject</th>
                            <th>From</th>
                            <th>Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.length === 0 ? (
                            <tr>
                                <td colSpan={6} style={{ textAlign: "center", padding: "40px" }}>
                                    No tickets found.
                                </td>
                            </tr>
                        ) : (
                            tickets.map(ticket => (
                                <tr key={ticket._id}>
                                    <td>
                                        <span className={`badge ${ticket.type === "bug" ? "danger" : "info"}`}>
                                            {ticket.type === "bug" ? "🐞 Bug" : "📚 Request"}
                                        </span>
                                    </td>
                                    <td>
                                        <strong>{ticket.subject}</strong>
                                        <div className="text-muted" style={{ fontSize: "0.85rem", marginTop: "5px" }}>
                                            {ticket.description}
                                        </div>
                                    </td>
                                    <td>
                                        <div>{ticket.email}</div>
                                        {ticket.user && <div className="text-muted" style={{ fontSize: "0.8rem" }}>User: {ticket.user.name}</div>}
                                    </td>
                                    <td>{new Date(ticket.createdAt).toLocaleDateString()}</td>
                                    <td>
                                        <span className={`status-pill ${ticket.status}`}>
                                            {ticket.status}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="admin-actions">
                                            {ticket.status === "open" && (
                                                <button
                                                    className="btn-action info"
                                                    onClick={() => updateStatus(ticket._id, "in-progress")}
                                                    title="Mark as In Progress"
                                                >
                                                    ⏳
                                                </button>
                                            )}
                                            {ticket.status !== "resolved" && ticket.status !== "closed" && (
                                                <button
                                                    className="btn-action success"
                                                    onClick={() => updateStatus(ticket._id, "resolved")}
                                                    title="Mark as Resolved"
                                                >
                                                    ✅
                                                </button>
                                            )}
                                            {ticket.status !== "closed" && (
                                                <button
                                                    className="btn-action danger"
                                                    onClick={() => updateStatus(ticket._id, "closed")}
                                                    title="Close Ticket"
                                                >
                                                    🔒
                                                </button>
                                            )}
                                            {(ticket.status === "resolved" || ticket.status === "closed") && (
                                                <button
                                                    className="btn-action secondary"
                                                    onClick={() => updateStatus(ticket._id, "open")}
                                                    title="Reopen Ticket"
                                                >
                                                    🔓
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminSupportManager;
