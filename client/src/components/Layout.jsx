import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Layout() {
  const navigate = useNavigate();
  const { setUser, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      const res = await fetch(`${API_URL}/api/logout`, {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        console.error("Logout failed");
        return;
      }

      setUser(null);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <>
      <nav>
        <p className="logo">Diary App</p>
        <div className="pagesNav">
          <Link to="/">Home</Link>
          {isAuthenticated && <Link to="/dashboard">Dashboard</Link>}
        </div>

        {!isAuthenticated && (
          <div className="auth-links">
            <Link to="/signup" className="btn-ghost">
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
          </div>
        )}

        {isAuthenticated && (
          <div className="auth-links">
            <button onClick={handleLogout} className="btn-ghost">
              Log Out
            </button>
          </div>
        )}
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
