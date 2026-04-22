CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE entries (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL,
    mood INTEGER CHECK (mood >= 0 AND mood <= 4),
    energy INTEGER CHECK (energy >= 0 AND energy <= 4),
    sleep_hours DECIMAL(3,1),
    thoughts TEXT,
    gratitude TEXT,
    ate_healthy BOOLEAN,
    workout_done BOOLEAN,
    meditation_done BOOLEAN,
    UNIQUE(user_id, entry_date)
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    entry_id INTEGER REFERENCES entries(id) ON DELETE CASCADE,
    task_description TEXT NOT NULL,
    completed BOOLEAN DEFAULT false
);