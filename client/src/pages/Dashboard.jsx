import { useState, useEffect, useMemo } from "react";
import Calendar from "../components/Calendar";

function rateMood(avg) {
  if (avg == null) return "No data yet";
  if (avg < 1) return "Awful";
  if (avg < 2) return "Bad";
  if (avg < 3) return "Neutral";
  if (avg < 4) return "Great";
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
      </div>
    </div>
  );
}
