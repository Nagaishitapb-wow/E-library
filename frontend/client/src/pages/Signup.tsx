import { useState } from "react";
import type { FormEvent } from "react";
import { signup } from "../api/auth";
import { useNavigate } from "react-router-dom";
import "../styles/auth.css";
import "../styles/global.css";

interface AxiosErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Signup = () => {
  const navigate = useNavigate();
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<boolean>(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const pwdError = validatePassword(password);
    if (pwdError) {
      setError(pwdError);
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await signup({ name, email, password });
      setSuccess(true);
    } catch (err: unknown) {
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  function parseError(err: unknown): string {
    const e = err as AxiosErrorShape;
    return e.response?.data?.message ?? "Something went wrong";
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
        <h1>Sign Up</h1>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="auth-input"
            placeholder="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              className="auth-input"
              placeholder="Password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          <div style={{ position: "relative", marginBottom: "20px" }}>
            <input
              className="auth-input"
              placeholder="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ marginBottom: 0 }}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              style={{
                position: "absolute",
                right: "10px",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#6b7280"
              }}
            >
              {showConfirmPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                  <line x1="1" y1="1" x2="23" y2="23"></line>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              )}
            </button>
          </div>

          {password && validatePassword(password) && (
            <p style={{ color: "orange", fontSize: "12px", marginTop: "5px", marginBottom: "15px" }}>{validatePassword(password)}</p>
          )}

          {confirmPassword && password !== confirmPassword && (
            <p style={{ color: "red", fontSize: "12px", marginTop: "5px", marginBottom: "15px" }}>Passwords do not match</p>
          )}

          {error && <p className="error">{error}</p>}

          {success ? (
            <div className="success-message" style={{ textAlign: "center", padding: "20px" }}>
              <h2 style={{ color: "#10b981", marginBottom: "10px" }}>Verification Email Sent!</h2>
              <p style={{ color: "var(--text-muted)", marginBottom: "20px" }}>
                Please check your inbox (and spam folder) to activate your account.
              </p>
              <button className="auth-btn" onClick={() => navigate("/login")}>
                Go to Login
              </button>
            </div>
          ) : (
            <button className="auth-btn" disabled={loading || !!validatePassword(password) || password !== confirmPassword}>
              {loading ? "Signing up..." : "Sign Up"}
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;
