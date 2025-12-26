import { logout } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import "../styles/profile.css";

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
    <div className="dashboard-container">
      {/* HEADER */}
      <div className="dashboard-header">
        <h1>Welcome{user ? `, ${user.name}` : ""} </h1>
        <p>Manage your library activity from one place</p>
      </div>

      {/* LOGGED-IN VIEW */}
      {user && (
        <>
          <div className="dashboard-grid">
            <Link to="/books" className="dashboard-card">
              <span className="icon">📚</span>
              <h3>Browse Books</h3>
              <p>Explore and borrow books</p>
            </Link>

            <Link to="/wishlist" className="dashboard-card">
              <span className="icon">❤️</span>
              <h3>Wishlist</h3>
              <p>Your saved books</p>
            </Link>

            <Link to="/borrowed" className="dashboard-card">
              <span className="icon">📖</span>
              <h3>Borrowed Books</h3>
              <p>Currently borrowed books</p>
            </Link>

            <Link to="/fines" className="dashboard-card">
              <span className="icon">💰</span>
              <h3>My Fines</h3>
              <p>Pending & paid fines</p>
            </Link>

            <Link to="/profile" className="dashboard-card">
              <span className="icon">👤</span>
              <h3>Profile</h3>
              <p>View & edit profile</p>
            </Link>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </>
      )}

      {/* GUEST VIEW */}
      {!user && (
        <div className="guest-actions">
          <Link to="/login" className="guest-btn primary">Login</Link>
          <Link to="/signup" className="guest-btn secondary">Sign Up</Link>
        </div>
      )}
    </div>
  );
}
