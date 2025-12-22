import { useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import "../styles/global.css";

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const pwdError = validatePassword(password);


  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await axios.post("http://localhost:4000/api/auth/reset-password", {
      token,
      newPassword: password,
    });
    alert("Password reset successful!");
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
        <h1>Reset Password</h1>

        <form onSubmit={handleSubmit}>
          <input
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {pwdError && <p style={{color:"red"}}>{pwdError}</p>}
          <button disabled={!!pwdError}>Update Password</button>

        </form>
      </div>
    </div>
  );
}
