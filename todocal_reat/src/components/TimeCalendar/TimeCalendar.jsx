import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "./TimeCalendar.css";
import TimeEventBlock from "./TimeEventBlock";

const hours = Array.from(
  { length: 24 },
  (_, i) => `${i.toString().padStart(2, "0")}:00`
);

function TimeCalendar({ selectedDate }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchEvents();
  }, [selectedDate]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/todos/all");
      const filtered = res.data.filter(
        (e) =>
          e.promiseDate && moment(e.promiseDate).isSame(selectedDate, "day")
      );
      setEvents(filtered);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  return (
    <div className="time-calendar">
      <div className="time-labels">
        {hours.map((h) => (
          <div key={h} className="time-label">
            {h}
          </div>
        ))}
      </div>

      <div className="time-slots">
        {hours.map((_, i) => (
          <div key={i} className="time-slot"></div>
        ))}

        {events.map((event, idx) => (
          <TimeEventBlock key={idx} event={event} />
        ))}
      </div>
    </div>
  );
}

export default TimeCalendar;
