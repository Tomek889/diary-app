import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/whoami`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, [location.pathname]);

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
          {user && <Link to="/dashboard">Dashboard</Link>}
        </div>

        {!user && (
          <div className="auth-links">
            <Link to="/signup" className="btn-ghost">
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
          </div>
        )}

        {user && (
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
