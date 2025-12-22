import { useState } from "react";
import type { FormEvent } from "react";
import type { AuthResponse } from "../types/auth";
import { login } from "../api/auth";
import { useNavigate, Link } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import "../styles/auth.css";
import "../styles/global.css";

interface AxiosErrorShape {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError("Email & password required");
      return;
    }

    try {
      setLoading(true);
      console.log("🔐 Login attempt starting...");
      const res: AuthResponse = await login({ email, password });
      console.log("✅ Login response received:", res);
      console.log("📝 Token from response:", res.token);

      localStorage.setItem("token", res.token!);
      localStorage.setItem("user", JSON.stringify(res.user!));

      console.log("💾 Token saved to localStorage");
      console.log("🔍 Verifying token in localStorage:", localStorage.getItem("token"));

      if (res.user!.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/");
      }
    } catch (err: unknown) {
      console.error("❌ Login error:", err);
      setError(parseError(err));
    } finally {
      setLoading(false);
    }
  }

  function parseError(err: unknown): string {
    const e = err as AxiosErrorShape;
    return e.response?.data?.message ?? "Something went wrong";
  }

  return (
    <div className="center-container">
      <div className="auth-card">
        <h1>Login</h1>

        <form onSubmit={handleSubmit}>
          <input
            className="auth-input"
            placeholder="Email"
            value={email}
            type="email"
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

          {error && <p className="error">{error}</p>}


          <div style={{ textAlign: "right", marginBottom: "12px" }}>
            <Link to="/forgot-password" style={{ color: "#2563ff", fontSize: "14px" }}>
              Forgot Password?
            </Link>
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>


        <p style={{ marginTop: "18px", fontSize: "15px" }}>
          Not a user?{" "}
          <Link to="/signup" style={{ color: "#2563ff", fontWeight: "bold" }}>
            Create Account
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Login;
