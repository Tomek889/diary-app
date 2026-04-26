import { useState, useEffect } from "react";
import { DayPicker } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import "react-day-picker/dist/style.css";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

function convertDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Calendar() {
  const [date, setDate] = useState();
  const [enteredDates, setEnteredDates] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_URL}/api/dates`, {
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
          throw new Error("Failed to load dates.");
        }
        return res.json();
      })
      .then((data) => {
        const dates = data.dates.map((d) => new Date(d));
        setEnteredDates(dates);
      })
      .catch((err) => {
        console.error("Error loading dates:", err);
      });
  }, [navigate]);

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    navigate(`/journal/${convertDate(selectedDate)}`);
  };

  return (
    <div className="calendar">
      <DayPicker
        navLayout="around"
        captionLayout="label"
        fixedWeeks
        mode="single"
        selected={date}
        onSelect={handleSelect}
        modifiers={{ entered: enteredDates }}
        modifiersClassNames={{ entered: "entered-day" }}
      />
    </div>
  );
}
