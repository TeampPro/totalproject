import { useState } from "react";
import moment from "moment";
import TimeCalendar from "../components/TimeCalendar/TimeCalendar";
import "../styles/TimeViewPage.css";

function TimeViewPage() {
  const [selectedDate, setSelectedDate] = useState(moment());

  return (
    <div className="timeview-page">
      <header className="timeview-header">
        <button
          onClick={() =>
            setSelectedDate(moment(selectedDate).subtract(1, "day"))
          }
        >
          ◀
        </button>
        <h2>{selectedDate.format("YYYY년 MM월 DD일")}</h2>
        <button
          onClick={() => setSelectedDate(moment(selectedDate).add(1, "day"))}
        >
          ▶
        </button>
      </header>

      <TimeCalendar selectedDate={selectedDate} />
    </div>
  );
}

export default TimeViewPage;
