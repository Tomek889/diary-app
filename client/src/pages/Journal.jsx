import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Modal from "../components/Modal";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export default function Journal() {
  const navigate = useNavigate();
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
    const loadEntry = async () => {
      setLoadingEntry(true);
      try {
        const res = await fetch(`${API_URL}/api/entry?date=${encodeURIComponent(date)}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (res.status === 401) {
          setLoadingEntry(false);
          navigate("/login");
          return;
        }

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
        setModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Failed to load entry",
          titleButton: "Go to Dashboard",
          action: () => {
            setModal((prev) => ({ ...prev, isOpen: false }));
            navigate("/dashboard");
          },
        });
      } finally {
        setLoadingEntry(false);
      }
    };

    loadEntry();
  }, [date, navigate]);

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

  const saveEntry = async ({ showSuccessModal = true } = {}) => {
    const endpoint = entryExists ? `${API_URL}/api/update` : `${API_URL}/api/entry`;
    const cleanedTasks = tasks.filter((t) => t.task_description.trim() !== "");
    const payload = { ...entry, entry_date: date, tasks: cleanedTasks };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to save entry");

    setEntryExists(true);

    if (showSuccessModal) {
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
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await saveEntry({ showSuccessModal: true });
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

  const handleGeneratePdf = async () => {
    try {
      await saveEntry({ showSuccessModal: true });

      const newTab = window.open("", "_blank");
      const res = await fetch(`${API_URL}/api/entry/${encodeURIComponent(date)}/pdf`, {
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to generate PDF");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      if (newTab) newTab.location.href = url;
    } catch (err) {
      console.error(err);
      setModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Could not save entry and generate PDF",
        titleButton: "Close",
        action: () => setModal((prev) => ({ ...prev, isOpen: false })),
      });
    }
  };

  if (loadingEntry) {
    return <p>Loading entry...</p>;
  }

  return (
    <div className="journal-page">
      <h1 className="journal-title">Journal</h1>
      <form onSubmit={handleSubmit} className="journal-form">
        <p className="journal-date">Journal for {date}</p>

        <div className="form-group">
          <label>Thoughts</label>
          <textarea
            name="thoughts"
            value={entry.thoughts}
            onChange={handleChange}
            placeholder="How was your day?"
          />
        </div>

        <div className="form-group">
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
              <button
                type="button"
                className="btn-ghost remove-task-btn"
                onClick={() => removeTask(index)}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-ghost add-task-btn"
            onClick={addTask}
          >
            + Add Task
          </button>
        </div>

        <div className="form-group">
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

        <button type="submit" className="btn-primary form-action-btn">
          Save Entry
        </button>
        <button
          type="button"
          className="btn-ghost form-action-btn generate-pdf-btn"
          onClick={handleGeneratePdf}
        >
          Save and Generate PDF
        </button>
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
