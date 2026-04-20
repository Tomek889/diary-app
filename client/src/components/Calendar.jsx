import { useState } from "react";
import { DayPicker } from "react-day-picker";
import { useNavigate } from "react-router-dom";
import "react-day-picker/dist/style.css";

function convertDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default function Calendar() {
  const [date, setDate] = useState();
  const navigate = useNavigate();

  const handleSelect = (selectedDate) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    navigate(`/journal/${convertDate(selectedDate)}`);
  };

  return <DayPicker mode="single" selected={date} onSelect={handleSelect} />;
}
