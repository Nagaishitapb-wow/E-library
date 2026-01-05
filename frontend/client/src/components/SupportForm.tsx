import React, { useState } from "react";
import { api } from "../api/auth";
import { toast } from "react-toastify";

interface SupportFormProps {
    type: "bug" | "request";
    title: string;
}

const SupportForm: React.FC<SupportFormProps> = ({ type, title }) => {
    const [email, setEmail] = useState("");
    const [subject, setSubject] = useState("");
    const [description, setDescription] = useState("");
    const [loading, setLoading] = useState(false);

    React.useEffect(() => {
        const userJson = localStorage.getItem("user");
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                if (user.email) setEmail(user.email);
            } catch (e) {
                console.error("Error parsing user from localStorage", e);
            }
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post("/support/submit", {
                email,
                type,
                subject,
                description
            });
            toast.success(`${type === "bug" ? "Bug report" : "Book request"} submitted successfully!`);
            setEmail("");
            setSubject("");
            setDescription("");
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Something went wrong. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form className="support-form" onSubmit={handleSubmit}>
            <h3>Submit a {title} Form</h3>
            <div className="form-group">
                <label>Email Address</label>
                <input
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Subject</label>
                <input
                    type="text"
                    placeholder={type === "bug" ? "What's the issue?" : "Book Title / Author"}
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                />
            </div>
            <div className="form-group">
                <label>Description</label>
                <textarea
                    placeholder={type === "bug" ? "Please describe the bug..." : "Why should we add this book?"}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                ></textarea>
            </div>
            <button type="submit" disabled={loading} className="btn-primary">
                {loading ? "Submitting..." : `Submit ${title}`}
            </button>
        </form>
    );
};

export default SupportForm;
