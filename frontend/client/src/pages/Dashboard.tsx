import { logout } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";

export default function Dashboard() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      localStorage.removeItem("user");
      navigate("/");
      window.location.reload();
    } catch (error) {
      console.error("Logout error", error);
      localStorage.removeItem("user");
      navigate("/");
      window.location.reload();
    }
  }

  return (
    <div className="center-container">
      <div className="dashboard-box">

        <h1>
          Welcome {user ? user.name : "Guest"}
        </h1>

        <br />

        {/* Logged-in View */}
        {user && (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px", textAlign: "center" }}>

            <Link to="/books" className="dash-link">📚 Browse Books</Link>
            <Link to="/wishlist" className="dash-link">❤️ Wishlist</Link>
            <Link to="/borrowed" className="dash-link">📖 Borrowed Books</Link>
            <Link to="/fines" className="dash-link">💸 My Fines</Link>
            <Link to="/profile" className="dash-link">👤 Profile</Link>

            <button
              onClick={handleLogout}
              style={{
                background: "#ff3b3b",
                padding: "10px 22px",
                border: "none",
                borderRadius: "6px",
                color: "#fff",
                fontSize: "16px",
                cursor: "pointer",
                marginTop: "10px",
                fontWeight: "bold"
              }}
            >
              Logout
            </button>

          </div>
        )}

        {/* Guest View */}
        {!user && (
          <div style={{ display: "flex", gap: "30px", justifyContent: "center" }}>
            <Link to="/login" style={{ color: "#fff", fontSize: "19px", fontWeight: "500" }}>Login</Link>
            <Link to="/signup" style={{ color: "#fff", fontSize: "19px", fontWeight: "500" }}>Signup</Link>
          </div>
        )}

      </div>
    </div>
  );
}
