import { logout } from "../api/auth";

export default function Dashboard() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;

  async function handleLogout() {
    try {
      await logout();
      localStorage.removeItem("user");
      window.location.href = "/";
    } catch (error) {
      console.error("Logout error", error);
      localStorage.removeItem("user");
      window.location.href = "/";
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

            <a href="/books" className="dash-link">📚 Browse Books</a>
            <a href="/wishlist" className="dash-link">❤️ Wishlist</a>
            <a href="/borrowed" className="dash-link">📖 Borrowed Books</a>
            <a href="/fines" className="dash-link">💸 My Fines</a>
            <a href="/profile" className="dash-link">👤 Profile</a>

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
            <a href="/login" style={{ color: "#fff", fontSize: "19px", fontWeight: "500" }}>Login</a>
            <a href="/signup" style={{ color: "#fff", fontSize: "19px", fontWeight: "500" }}>Signup</a>
          </div>
        )}

      </div>
    </div>
  );
}
