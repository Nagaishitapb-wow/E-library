import { useState } from "react";
import axios from "axios";
import "../styles/global.css";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await axios.post("http://localhost:4000/api/auth/forgot-password", { email });
    alert("Reset email sent!");
  }
  function validatePassword(pwd: string): string | null {
  if (pwd.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(pwd)) return "Password must contain at least one uppercase letter";
  if (!/[0-9]/.test(pwd)) return "Password must contain at least one number";
  if (!/[!@#$%^&*]/.test(pwd)) return "Password must contain a special character (!@#$%^&*)";
  return null; // means valid
}

  return (
    <div className="center-container">
      <div className="auth-card">
        <h1>Forgot Password</h1>

        <form onSubmit={handleSubmit} className="reset-wrapper">
  <input
    type="email"
    className="reset-input"
    placeholder="Enter your email"
    value={email}
    onChange={(e) => setEmail(e.target.value)}
  />
  
  <button type="submit" className="reset-btn">
    Send Reset Link
  </button>
</form>

      </div>
    </div>
  );
}
