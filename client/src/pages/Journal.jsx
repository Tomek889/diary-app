import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";

export default function Journal() {
  const navigate = useNavigate();
  const [email] = useState(() => localStorage.getItem("userEmail") || "");
  const { date } = useParams();
  const [modal, setModal] = useState({
    isOpen: false,
    type: "",
    title: "",
    message: "",
    titleButton: "",
    action: null,
  });

  const [entry, setEntry] = useState({
    mood: 2,
    energy: 2,
    sleep_hours: "",
    thoughts: "",
    gratitude: "",
    ate_healthy: false,
    workout_done: false,
    meditation_done: false,
  });

  const [tasks, setTasks] = useState([
    { task_description: "", completed: false },
  ]);

  const [loadingEntry, setLoadingEntry] = useState(true);
  const [entryExists, setEntryExists] = useState(false);

  useEffect(() => {
    if (!email || !date) return;

    const loadEntry = async () => {
      setLoadingEntry(true);
      try {
        const res = await fetch(`/api/entry?date=${encodeURIComponent(date)}`, {
          headers: {
            "Content-Type": "application/json",
            "X-User-Email": email,
          },
        });

        if (res.status === 404) {
          setLoadingEntry(false);
          setEntryExists(false);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to load entry");
        }

        const data = await res.json();
        setEntryExists(true);

        setEntry({
          mood: Number(data.entry.mood ?? 2),
          energy: Number(data.entry.energy ?? 2),
          sleep_hours: data.entry.sleep_hours ?? "",
          thoughts: data.entry.thoughts ?? "",
          gratitude: data.entry.gratitude ?? "",
          ate_healthy: Boolean(data.entry.ate_healthy),
          workout_done: Boolean(data.entry.workout_done),
          meditation_done: Boolean(data.entry.meditation_done),
        });

        setTasks(
          data.tasks?.length
            ? data.tasks.map((t) => ({
                task_description: t.task_description ?? "",
                completed: Boolean(t.completed),
              }))
            : [{ task_description: "", completed: false }],
        );
      } catch (err) {
        console.error(err);
        alert("Error loading entry");
      } finally {
        setLoadingEntry(false);
      }
    };

    loadEntry();
  }, [email, date]);

  const moodOptions = [
    { value: 0, label: "Awful" },
    { value: 1, label: "Bad" },
    { value: 2, label: "Neutral" },
    { value: 3, label: "Great" },
    { value: 4, label: "Amazing" },
  ];

  const energyOptions = [
    { value: 0, label: "Exhausted" },
    { value: 1, label: "Low" },
    { value: 2, label: "Neutral" },
    { value: 3, label: "Energized" },
    { value: 4, label: "Full of Energy" },
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEntry((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const addTask = () => {
    setTasks((prev) => [...prev, { task_description: "", completed: false }]);
  };

  const removeTask = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleTaskChange = (index, value) => {
    const newTasks = [...tasks];
    newTasks[index].task_description = value;
    setTasks(newTasks);
  };

  const handleTaskDone = (index, done) => {
    const newTasks = [...tasks];
    newTasks[index].completed = done;
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = entryExists ? "/api/update" : "/api/entry";
    const payload = { ...entry, entry_date: date, tasks };

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Email": email,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save entry");

      setModal({
        isOpen: true,
        type: "success",
        title: "Success",
        message: entryExists
          ? "Entry updated successfully!"
          : "Entry saved successfully!",
        titleButton: "Go to Dashboard",
        action: () => {
          setModal((prev) => ({ ...prev, isOpen: false }));
          navigate("/dashboard");
        },
      });
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to save entry",
        titleButton: "Close",
        action: () => setModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  if (!email) {
    return <Navigate to="/login" replace />;
  }

  if (loadingEntry) {
    return <p>Loading entry...</p>;
  }

  return (
    <div>
      <h1>Journal</h1>
      <form onSubmit={handleSubmit} className="journal-form">
        <p>Journal for {date}</p>
        <div>
          <label>Thoughts</label>
          <textarea
            name="thoughts"
            value={entry.thoughts}
            onChange={handleChange}
            placeholder="How was your day?"
          />
        </div>
        <div>
          <label>Sleep Hours</label>
          <input
            type="number"
            name="sleep_hours"
            step="0.5"
            max={24}
            min={0}
            value={entry.sleep_hours}
            onChange={handleChange}
          />
        </div>
        <div className="tasks-section">
          <h4>Tasks</h4>
          {tasks.map((task, index) => (
            <div key={index} className="task-item">
              <input
                type="checkbox"
                name="taskDone"
                id={`taskDone-${index}`}
                checked={task.completed}
                onChange={(e) => handleTaskDone(index, e.target.checked)}
              />
              <input
                type="text"
                value={task.task_description}
                onChange={(e) => handleTaskChange(index, e.target.value)}
                placeholder={`Task ${index + 1}`}
              />
              <button type="button" onClick={() => removeTask(index)}>
                Remove
              </button>
            </div>
          ))}
          <button type="button" onClick={addTask}>
            + Add Task
          </button>
        </div>
        <div>
          <label>Gratitude</label>
          <textarea
            name="gratitude"
            value={entry.gratitude}
            onChange={handleChange}
            placeholder="What are you grateful for?"
          />
        </div>
        <div className="mood-selector">
          <p>How are you feeling?</p>
          <div>
            {moodOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEntry({ ...entry, mood: option.value })}
                style={{
                  backgroundColor:
                    entry.mood === option.value ? "#d1e7ff" : "white",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="energy-selector">
          <p>How is your energy level?</p>
          <div>
            {energyOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setEntry({ ...entry, energy: option.value })}
                style={{
                  backgroundColor:
                    entry.energy === option.value ? "#d1e7ff" : "white",
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="ate_healthy"
              checked={entry.ate_healthy}
              onChange={handleChange}
            />
            Ate Healthy?
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="workout_done"
              checked={entry.workout_done}
              onChange={handleChange}
            />
            Workout Done?
          </label>
        </div>
        <div>
          <label>
            <input
              type="checkbox"
              name="meditation_done"
              checked={entry.meditation_done}
              onChange={handleChange}
            />
            Meditation Done?
          </label>
        </div>

        <button type="submit">Save Entry</button>
      </form>

      {modal.isOpen && (
        <Modal
          isOpen={modal.isOpen}
          type={modal.type}
          title={modal.title}
          message={modal.message}
          titleButton={modal.titleButton}
          action={modal.action}
        />
      )}
    </div>
  );
}
