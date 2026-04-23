import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function HomePage() {
  const [email] = useState(() => {
    if (typeof window === "undefined") return "";
    return window.localStorage.getItem("userEmail") || "";
  });

  const navigate = useNavigate();

  return (
    <section className="home">
      <div className="home-content">
        <h1>Welcome to your Diary App</h1>
        <p>
          Track your mood, tasks, and daily reflections in one place. Generate
          PDF reports of your entries and visualize your progress over time.
          Start journaling today to gain insights into your well-being and
          productivity!
        </p>

        {email ? (
          <div className="login-buttons">
            <button
              className="btn-primary"
              onClick={() => navigate("/dashboard")}
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div className="login-buttons">
            <Link to="/signup" className="btn-ghost">
              Sign Up
            </Link>
            <Link to="/login" className="btn-primary">
              Log In
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
