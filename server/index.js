const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken");
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
  deleteTasks,
} = require("./db/queries");
const { generatePdf } = require("./pdf/journalPdf");
require("dotenv").config();
const bcrypt = require("bcrypt");

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET;

const allowedOrigins = [
  "http://localhost:5173",
  "https://diary-app-jet.vercel.app",
];

app.set("trust proxy", 1);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

function getCookieOptions() {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    maxAge: 1000 * 60 * 60 * 24 * 7,
    path: "/",
  };
}

function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
}

app.get("/api/whoami", authRequired, (req, res) => {
  return res.json({ user: req.user });
});

app.get("/api/dates", authRequired, async (req, res) => {
  const email = req.user.email;

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

app.get("/api/entry", authRequired,async (req, res) => {
  const email = req.user.email;
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
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ error: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await insertUser(email.trim().toLowerCase(), passwordHash);

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, getCookieOptions());
    return res.status(201).json({ user: { id: user.id, email: user.email } });
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
    const { email, password } = req.body;

    if (!email || !email.trim()) {
      return res.status(400).json({ error: "Email is required" });
    }

    if (!password) {
      return res.status(400).json({ error: "Password is required" });
    }

    const user = await validateUser(email.trim().toLowerCase());
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "7d",
    });

    res.cookie("token", token, getCookieOptions());
    return res.json({ user: { id: user.id, email: user.email } });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.get("/api/stats", authRequired, async (req, res) => {
  try {
    const email = req.user.email;

    const stats = await getStatsByEmail(email);

    if (!stats) {
      return res.json({
        workoutCount: null,
        meditationCount: null,
        monthTasksCompletion: null,
        averageSleepDuration: null,
        monthMoodAvg: null,
      });
    }

    return res.json({
      workoutCount: stats.workout_count,
      meditationCount: stats.meditation_count,
      monthTasksCompletion: stats.month_tasks_completion,
      averageSleepDuration: stats.average_sleep_duration,
      monthMoodAvg: stats.month_mood_avg,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/api/entry", authRequired, async (req, res) => {
  const email = req.user.email;
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
    tasks = [],
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

app.post("/api/update", authRequired, async (req, res) => {
  const email = req.user.email;
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
    tasks = [],
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

    await deleteTasks(entry.id);

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

app.get("/api/entry/:date/pdf", authRequired, async (req, res) => {
  try {
    const email = req.user.email;
    const date = req.params.date;

    if (!email) return res.status(401).json({ error: "Unauthorized" });
    if (!date) return res.status(400).json({ error: "Date is required" });

    const entry = await getEntry(email, date);
    if (!entry) return res.status(404).json({ error: "Entry not found" });

    const tasks = await getTasks(entry.id);
    const pdfBuffer = await generatePdf({ entry, tasks, email, date });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=journal-${date}.pdf`,
    );
    return res.send(pdfBuffer);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
