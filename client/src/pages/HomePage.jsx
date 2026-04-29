import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
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

        {isAuthenticated ? (
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
