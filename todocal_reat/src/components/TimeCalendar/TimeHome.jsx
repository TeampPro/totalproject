import Calendar from "../../pages/Todo/Calendar";
import TimeViewPage from "./TimeViewPage";
import "../../styles/TimeCalendar/TimeHome.css";

function TimeHome({ onTodosChange }) {
  return (
    <div className="time-home">
      {/* 상단: 캘린더 제목만 표시 */}
      <div className="time-top-row">
        <div className="time-title">📅 캘린더</div>
      </div>

      {/* 내용: 위에는 캘린더, 아래에는 스케줄표 (항상 둘 다 보이게) */}
      <div className="time-content">
        <Calendar onTodosChange={onTodosChange} />

        <div className="timeview-wrapper">
          <TimeViewPage />
        </div>
      </div>
    </div>
  );
}

export default TimeHome;
