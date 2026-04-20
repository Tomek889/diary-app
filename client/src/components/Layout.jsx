import { Link, Outlet } from "react-router-dom";
import { useState } from "react";

export default function Layout() {
  const [email, setEmail] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("userEmail") || "";
  });

  const handleLogout = () => {
    window.localStorage.removeItem("userEmail");
    setEmail("");
  };

  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        {!email && <Link to="/signup">Sign Up</Link>}
        {!email && <Link to="/login">Log In</Link>}
        {email && <Link to="/dashboard">Dashboard</Link>}
        {email && <button onClick={handleLogout}>Log Out</button>}
      </nav>

      <main>
        <Outlet />
      </main>
    </>
  );
}
