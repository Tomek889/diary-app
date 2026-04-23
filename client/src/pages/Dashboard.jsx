import { useState, useEffect, useMemo } from "react";
import { Link, Navigate } from "react-router-dom";
import Calendar from "../components/Calendar";

function rateMood(avg) {
  if (avg == null) return "No data yet";
  if (avg < 0.8) return "Awful";
  if (avg < 1.6) return "Bad";
  if (avg < 2.4) return "Neutral";
  if (avg < 3.2) return "Great";
  return "Amazing";
}

function percent(value) {
  if (value == null) return "No data yet";
  return `${Math.round(value * 100)}%`;
}

export default function Dashboard() {
  const [email] = useState(() => localStorage.getItem("userEmail") || "");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;

    fetch("/api/stats", {
      headers: {
        "Content-Type": "application/json",
        "X-User-Email": email,
      },
    })
      .then(async (res) => {
        if (!res.ok) {
          throw new Error("Failed to load stats.");
        }
        return res.json();
      })
      .then((data) => {
        setStats(data);
      })
      .catch((err) => {
        setError(err.message || "Error");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [email]);

  const noData = useMemo(() => {
    if (!stats) return true;
    return [
      stats.overallTasksCompletion,
      stats.monthTasksCompletion,
      stats.overallMoodAvg,
      stats.monthMoodAvg,
    ].every((val) => val == null);
  }, [stats]);

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-left">
        <h1>Dashboard</h1>

        {loading && <p>Loading stats...</p>}
        {!loading && error && <p>{error}</p>}
        {!loading && !error && noData && <p>No data yet for your account</p>}

        {!loading && !error && (
          <div className="stats-grid">
            <div className="stat-card">
              <h2>Tasks completed (overall)</h2>
              <p>{percent(stats?.overallTasksCompletion)}</p>
            </div>
            <div className="stat-card">
              <h2>Tasks completed (this month)</h2>
              <p>{percent(stats?.monthTasksCompletion)}</p>
            </div>
            <div className="stat-card">
              <h2>Overall mood</h2>
              <p>{rateMood(stats?.overallMoodAvg)}</p>
            </div>
            <div className="stat-card">
              <h2>This month's mood</h2>
              <p>{rateMood(stats?.monthMoodAvg)}</p>
            </div>
          </div>
        )}
      </div>

      <div className="dashboard-right">
        <h2>Your Journal</h2>
        <Calendar />
        <Link className="today-entry-btn" to={`/journal/${todayDate}`}>
          Go to today's entry
        </Link>
      </div>
    </div>
  );
}
