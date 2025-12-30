import { logout, api } from "../api/auth";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "../styles/profile.css";

interface UserStats {
  totalBorrowed: number;
  currentlyBorrowed: number;
  totalFines: number;
  wishlistCount: number;
}

export default function Dashboard() {
  const userJson = localStorage.getItem("user");
  const user = userJson ? JSON.parse(userJson) : null;
  const navigate = useNavigate();

  const [stats, setStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchUserStats();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const res = await api.get("/user/profile");
      setStats(res.data.statistics);
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setLoading(false);
    }
  };

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
          {/* STATISTICS SECTION */}
          {loading ? (
            <div className="stats-loading">Loading your statistics...</div>
          ) : stats ? (
            <div className="stats-grid">
              <div className="stat-card">
                <span className="stat-icon">📚</span>
                <div className="stat-info">
                  <h3>{stats.totalBorrowed}</h3>
                  <p>Total Borrowed</p>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">📖</span>
                <div className="stat-info">
                  <h3>{stats.currentlyBorrowed}</h3>
                  <p>Currently Borrowed</p>
                </div>
              </div>

              <div className={`stat-card ${stats.totalFines > 0 ? 'fines-warning' : ''}`}>
                <span className="stat-icon">💰</span>
                <div className="stat-info">
                  <h3 className={stats.totalFines > 0 ? 'text-danger' : 'text-success'}>
                    ₹{stats.totalFines}
                  </h3>
                  <p>Total Fines</p>
                </div>
              </div>

              <div className="stat-card">
                <span className="stat-icon">❤️</span>
                <div className="stat-info">
                  <h3>{stats.wishlistCount}</h3>
                  <p>Wishlist Items</p>
                </div>
              </div>
            </div>
          ) : null}

          {/* QUICK ACTIONS */}
          <h2 className="section-title">Quick Actions</h2>
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
