const express = require("express");
const cors = require("cors");
const {
  getStatsByEmail,
  insertUser,
  validateUser,
  insertEntry,
  insertTask,
  getEntry,
  getTasks,
  getDatesWithEntries,
  updateEntry,
} = require("./db/queries");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.get("/api/dates", async (req, res) => {
  const email = req.get("X-User-Email") || "";

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    const dates = await getDatesWithEntries(email.trim().toLowerCase());
    return res.json({ dates });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/entry", async (req, res) => {
  const email = req.get("X-User-Email") || "";
  const date = req.query.date;

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!date) {
      return res.status(400).json({ error: "Date is required" });
    }

    const entry = await getEntry(email.trim().toLowerCase(), date);
    if (!entry) {
      return res.status(404).json({ error: "Entry not found" });
    }

    const tasks = await getTasks(entry.id);

    return res.json({ entry, tasks });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

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

app.post("/api/entry", async (req, res) => {
  const email = req.get("X-User-Email") || "";
  const {
    entry_date,
    mood,
    energy,
    sleep_hours: hours,
    thoughts,
    gratitude,
    ate_healthy,
    workout_done,
    meditation_done,
    tasks,
  } = req.body;

  const sleep_hours = hours === "" || hours == null ? null : hours;

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!entry_date) {
      return res.status(400).json({ error: "Entry date is required" });
    }
    if (hours < 0 || hours > 24) {
      return res.status(400).json({ error: "Invalid sleep hours" });
    }

    const entry = await insertEntry(
      email.trim().toLowerCase(),
      entry_date,
      mood,
      energy,
      sleep_hours,
      thoughts,
      gratitude,
      ate_healthy,
      workout_done,
      meditation_done,
    );

    for (const task of tasks) {
      await insertTask(entry.id, task.task_description, task.completed);
    }

    return res.status(201).json({ entry, message: "Entry saved successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/update", async (req, res) => {
  const email = req.get("X-User-Email") || "";
  const {
    entry_date,
    mood,
    energy,
    sleep_hours: hours,
    thoughts,
    gratitude,
    ate_healthy,
    workout_done,
    meditation_done,
    tasks,
  } = req.body;

  const sleep_hours = hours === "" || hours == null ? null : hours;

  try {
    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }
    if (!entry_date) {
      return res.status(400).json({ error: "Entry date is required" });
    }
    if (hours < 0 || hours > 24) {
      return res.status(400).json({ error: "Invalid sleep hours" });
    }

    const entry = await updateEntry(
      email.trim().toLowerCase(),
      entry_date,
      mood,
      energy,
      sleep_hours,
      thoughts,
      gratitude,
      ate_healthy,
      workout_done,
      meditation_done,
    );

    for (const task of tasks) {
      await insertTask(entry.id, task.task_description, task.completed);
    }

    return res
      .status(201)
      .json({ entry, message: "Entry updated successfully" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
