import { useState } from "react";
import { useParams } from "react-router-dom";
import { validatePassword } from "../utils/validation";
import { api } from "../api/auth";
import "../styles/global.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const pwdError = validatePassword(password);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await api.post("/auth/reset-password", {
      token,
      newPassword: password,
    });
    alert("Password reset successful!");
  }



  return (
    <div className="center-container">
      <div className="auth-card">
        <h1>Reset Password</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            className="auth-input"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {pwdError && <p className="error" style={{ color: "orange", marginBottom: "15px" }}>{pwdError}</p>}
          <button className="auth-btn" disabled={!!pwdError}>
            Update Password
          </button>

        </form>
      </div>
    </div>
  );
}
