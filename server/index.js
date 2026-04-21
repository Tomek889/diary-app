const express = require("express");
const cors = require("cors");
const { getStatsByEmail, insertUser, validateUser } = require("./db/queries");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post("/api/signup", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await insertUser(email.trim().toLowerCase());
    return res.status(201).json({ user });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ error: "Email already exists" });
    }
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const user = await validateUser(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    return res.json({ user });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const email = req.get("X-User-Email") || "";
    if (!email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const stats = await getStatsByEmail(email);

    if (!stats) {
      return res.json({
        overallTasksCompletion: null,
        monthTasksCompletion: null,
        overallMoodAvg: null,
        monthMoodAvg: null,
      });
    }

    return res.json({
      overallTasksCompletion: stats.overall_tasks_completion,
      monthTasksCompletion: stats.month_tasks_completion,
      overallMoodAvg: stats.overall_mood_avg,
      monthMoodAvg: stats.month_mood_avg,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
