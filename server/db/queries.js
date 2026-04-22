const pool = require("./db");

async function getEntry(email, entry_date) {
  const { rows } = await pool.query(
    "SELECT * FROM entries WHERE user_id = (SELECT id FROM users WHERE email = $1) AND entry_date = $2",
    [email, entry_date],
  );
  return rows[0];
}

async function insertEntry(
  email,
  entry_date,
  mood,
  energy,
  sleep_hours,
  thoughts,
  gratitude,
  ate_healthy,
  workout_done,
  meditation_done,
) {
  const { rows } = await pool.query(
    `INSERT INTO entries (user_id, entry_date, mood, energy, sleep_hours, thoughts, gratitude, ate_healthy, workout_done, meditation_done)
     VALUES ((SELECT id FROM users WHERE email = $1), $2, $3, $4, $5, $6, $7, $8, $9, $10)
     RETURNING *`,
    [
      email,
      entry_date,
      mood,
      energy,
      sleep_hours,
      thoughts,
      gratitude,
      ate_healthy,
      workout_done,
      meditation_done,
    ],
  );
  return rows[0];
}

async function insertTask(entry_id, task_description, completed) {
    const { rows } = await pool.query(
        `INSERT INTO tasks (entry_id, task_description, completed) VALUES ($1, $2, $3) RETURNING *`,
        [entry_id, task_description, completed]
    );
    return rows[0];
}

async function getTasks(entry_id) {
  const { rows } = await pool.query("SELECT * FROM tasks WHERE entry_id = $1", [
    entry_id,
  ]);
  return rows;
}

async function insertUser(email, passwordHash = "zaq1") {
  const { rows } = await pool.query(
    "INSERT INTO users (email, password) VALUES ($1, $2) RETURNING *",
    [email, passwordHash],
  );
  return rows[0];
}

async function validateUser(email, passwordHash = "zaq1") {
  const { rows } = await pool.query(
    "SELECT * FROM users WHERE email = $1 AND password = $2",
    [email, passwordHash],
  );
  return rows[0];
}

async function getStatsByEmail(email) {
  const { rows } = await pool.query(
    `
    SELECT
      (
        SELECT AVG(CASE WHEN t.completed THEN 1.0 ELSE 0.0 END)
        FROM entries e
        JOIN tasks t ON t.entry_id = e.id
        WHERE e.user_id = u.id
      ) AS overall_tasks_completion,
      (
        SELECT AVG(CASE WHEN t.completed THEN 1.0 ELSE 0.0 END)
        FROM entries e
        JOIN tasks t ON t.entry_id = e.id
        WHERE e.user_id = u.id
          AND e.entry_date >= date_trunc('month', CURRENT_DATE)
      ) AS month_tasks_completion,
      (
        SELECT AVG(e.mood::numeric)
        FROM entries e
        WHERE e.user_id = u.id
      ) AS overall_mood_avg,
      (
        SELECT AVG(e.mood::numeric)
        FROM entries e
        WHERE e.user_id = u.id
          AND e.entry_date >= date_trunc('month', CURRENT_DATE)
      ) AS month_mood_avg
    FROM users u
    WHERE u.email = $1
    LIMIT 1
    `,
    [email],
  );

  return rows[0] || null;
}

module.exports = {
  getEntry,
  getTasks,
  insertUser,
  validateUser,
  getStatsByEmail,
  insertEntry,
  insertTask,
};
