import { Link, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("userEmail") || "";
  });

  const navigate = useNavigate();

  const handleLogout = () => {
    window.localStorage.removeItem("userEmail");
    setEmail("");
    navigate("/");
    window.location.reload();
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
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Log In</Link>
          </div>
        )}
        <div>{email && <button onClick={handleLogout}>Log Out</button>}</div>
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
