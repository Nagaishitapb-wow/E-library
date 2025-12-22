import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../styles/auth.css";

const VerifyEmail = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
    const [message, setMessage] = useState<string>("");

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await axios.post(
                    "http://localhost:4000/api/auth/verify-email",
                    { token }
                );
                setStatus("success");
                setMessage(res.data.message);
            } catch (err: any) {
                setStatus("error");
                setMessage(
                    err.response?.data?.message ||
                    "Verification failed. The link may be invalid or expired."
                );
            }
        };

        if (token) verify();
    }, [token]);


    return (
        <div className="center-container">
            <div className="auth-card" style={{ textAlign: "center" }}>
                {status === "loading" && (
                    <>
                        <h1>Verifying...</h1>
                        <p>Please wait while we activate your account.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <h1 style={{ color: "#10b981" }}>Success!</h1>
                        <p style={{ marginBottom: "20px" }}>{message}</p>
                        <button className="auth-btn" onClick={() => navigate("/login")}>
                            Go to Login
                        </button>
                    </>
                )}

                {status === "error" && (
                    <>
                        <h1 style={{ color: "#ef4444" }}>Oops!</h1>
                        <p style={{ marginBottom: "20px" }}>{message}</p>
                        <Link to="/signup" className="btn-signup" style={{ display: "inline-block", padding: "10px 20px" }}>
                            Back to Sign Up
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
};

export default VerifyEmail;
