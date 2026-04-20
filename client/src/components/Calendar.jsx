import { useState } from "react";
import { Day, DayPicker } from "react-day-picker";

export default function Calendar() {
  const [date, setDate] = useState();

  return (
    <>
      <button
        popoverTarget="rdp-popover"
        className="input input-border"
        style={{ anchorName: "--rdp" }}
      >
        {date ? date.toLocaleDateString() : "Pick a date"}
      </button>

      <div
        popover="auto"
        id="rdp-popover"
        className="dropdown"
        style={{ positionAnchor: "--rdp" }}
      >
        <DayPicker
          className="react-day-picker"
          mode="single"
          selected={date}
          onSelect={setDate}
        />
      </div>
    </>
  );
}