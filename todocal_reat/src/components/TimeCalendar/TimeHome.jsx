import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../../pages/Todo/Calendar";
import TimeViewPage from "./TimeViewPage";
import "../../styles/TimeCalendar/TimeHome.css";

function TimeHome({ onTodosChange, disabled, calendarRef }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const navigate = useNavigate();

  const requireLogin = () => {
    if (disabled) {
      alert("로그인이 필요합니다!");
      return false;
    }
    return true;
  };

  return (
    <div className={`time-home ${activeTab}`}>
      <div className="time-top-row">
        <div className="tabs-center">
          <button
            className={activeTab === "calendar" ? "tab active" : "tab"}
            onClick={(e) => {
              e.stopPropagation();
              if (requireLogin()) setActiveTab("calendar");
            }}
          >
            📅 캘린더
          </button>

          <button
            className={activeTab === "schedule" ? "tab active" : "tab"}
            onClick={(e) => {
              e.stopPropagation();
              if (requireLogin()) setActiveTab("schedule");
            }}
          >
            📋 스케줄표
          </button>
        </div>

        {/* + 버튼 */}
        <button
          className="add-btn"
          onClick={(e) => {
            e.stopPropagation();
            if (!requireLogin()) return;
            navigate("/todo");
          }}
        >
          +
        </button>
      </div>

      <div className="time-content">
        {activeTab === "calendar" && (
          <Calendar
            ref={calendarRef}
            onTodosChange={onTodosChange} // ✅ 그냥 그대로 넘기기
          />
        )}
        {activeTab === "schedule" && <TimeViewPage />}
      </div>
    </div>
  );
}

export default TimeHome;
