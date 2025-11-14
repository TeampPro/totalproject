// src/components/TimeCalendar/TimeHome.jsx
import { useState } from "react";
import Calendar from "../../pages/Calendar.jsx"; // ✅ 원래 쓰던 캘린더
import TimeViewPage from "./TimeViewPage";
import "./TimeHome.css";
// 필요하면 아래 두 개 유지, 아니면 빼도 됨
// import "./TimeCalendar.css";
// import "./TimeViewPage.css";

function TimeHome({ onTodosChange }) {
  const [activeTab, setActiveTab] = useState("calendar");

  return (
    <div className={`time-home ${activeTab}`}>
      {/* 탭 바 */}
      <div className="time-tabs">
        <button
          className={activeTab === "calendar" ? "tab active" : "tab"}
          onClick={() => setActiveTab("calendar")}
        >
          📅 캘린더
        </button>
        <button
          className={activeTab === "schedule" ? "tab active" : "tab"}
          onClick={() => setActiveTab("schedule")}
        >
          📋 스케줄표
        </button>
      </div>

      {/* 내용 영역: 여기서 "딱 하나"만 렌더 */}
      <div className="time-content">
        {activeTab === "calendar" && <Calendar onTodosChange={onTodosChange} />}
        {activeTab === "schedule" && <TimeViewPage />}
      </div>
    </div>
  );
}

export default TimeHome;
