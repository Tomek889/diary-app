import { useState, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Calendar from "../components/Calendar";
import CountUp from "../components/CountUp";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function rateMood(avg) {
  if (avg == null) return "No data yet";
  if (avg < 0.8) return "Awful";
  if (avg < 1.6) return "Bad";
  if (avg < 2.4) return "Neutral";
  if (avg < 3.2) return "Great";
  return "Amazing";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/api/stats`, {
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    })
      .then(async (res) => {
        if (res.status === 401) {
          navigate("/login", { replace: true });
          return null;
        }
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
  }, [navigate]);

  const noData = useMemo(() => {
    if (!stats) return true;
    return [
      stats.workoutCount,
      stats.meditationCount,
      stats.monthTasksCompletion,
      stats.averageSleepDuration,
      stats.monthMoodAvg,
    ].every((val) => val == null);
  }, [stats]);

  const today = new Date();
  const todayDate = `${today.getFullYear()}-${String(
    today.getMonth() + 1,
  ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

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
              <h2>Tasks completed this month</h2>
              <p>
                {stats?.monthTasksCompletion != null ? (
                  <>
                    <CountUp
                      from={0}
                      to={Math.round(stats.monthTasksCompletion * 100)}
                      separator=","
                      direction="up"
                      duration={1.5}
                      className="count-up-text"
                      delay={0.1}
                    />
                    {""}%
                  </>
                ) : (
                  "No data yet"
                )}
              </p>
            </div>
            <div className="stat-card">
              <h2>This month's mood</h2>
              <p>{rateMood(stats?.monthMoodAvg)}</p>
            </div>
            <div className="stat-card">
              <h2>Number of workouts this month</h2>
              <p>
                {stats?.workoutCount != null ? (
                  <CountUp
                    from={0}
                    to={stats.workoutCount}
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                    delay={0.1}
                  />
                ) : (
                  "No data yet"
                )}
              </p>
            </div>
            <div className="stat-card">
              <h2>Number of meditation sessions this month</h2>
              <p>
                {stats?.meditationCount != null ? (
                  <>
                    <CountUp
                      from={0}
                      to={stats.meditationCount}
                      separator=","
                      direction="up"
                      duration={1.5}
                      className="count-up-text"
                      delay={0.1}
                    />
                  </>
                ) : (
                  "No data yet"
                )}
              </p>
            </div>
            <div className="stat-card">
              <h2>Average sleep duration this month</h2>
              <p>
                {stats?.averageSleepDuration != null ? (
                  <>
                    <CountUp
                      from={0}
                      to={Math.round(stats.averageSleepDuration)}
                      separator=","
                      direction="up"
                      duration={1.5}
                      className="count-up-text"
                      delay={0.1}
                    />{" "}
                    hrs
                  </>
                ) : (
                  "No data yet"
                )}
              </p>
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
