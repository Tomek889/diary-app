import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function HomePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/whoami`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setUser(data?.user ?? null))
      .catch(() => setUser(null));
  }, []);

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

        {user ? (
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
