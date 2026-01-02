import { useState } from "react";
import { api } from "../api/auth";
import "../styles/global.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      await api.post("/auth/forgot-password", { email });
      alert("Reset email sent!");
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to send reset email");
    }
  }

  return (
    <div className="center-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            className="auth-input"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button type="submit" className="auth-btn">
            Send Reset Link
          </button>
        </form>

      </div>
    </div>
  );
}
