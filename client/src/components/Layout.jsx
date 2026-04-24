import { Link, Outlet, useNavigate } from "react-router-dom";

export default function Layout() {
  const email =
    typeof window === "undefined"
      ? ""
      : window.localStorage.getItem("userEmail") || "";

  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem("userEmail");
    navigate("/");
  };

  return (
    <>
      <nav>
        <p className="logo">Diary App</p>
        <div className="pagesNav">
          <Link to="/">Home</Link>
          {email && <Link to="/dashboard">Dashboard</Link>}
        </div>

        {!email && (
          <div className="auth-links">
            <Link to="/signup" className="btn-ghost">
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
          </div>
        )}

        {email && (
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
