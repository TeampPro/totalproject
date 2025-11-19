import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Calendar from "../../pages/Calendar.jsx";
import TimeViewPage from "./TimeViewPage";
import "./TimeHome.css";

function TimeHome({ onTodosChange }) {
  const [activeTab, setActiveTab] = useState("calendar");
  const navigate = useNavigate(); // ⭐ 추가됨

  return (
    <div className={`time-home ${activeTab}`}>
      {/* 상단 중앙탭 + 우측 +버튼 */}
      <div className="time-top-row">
        <div className="tabs-center">
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

        {/* ⭐ 기능 연결 */}
        <button className="add-btn" onClick={() => navigate("/todo")}>
          +
        </button>
      </div>

      <div className="time-content">
        {activeTab === "calendar" && <Calendar onTodosChange={onTodosChange} />}
        {activeTab === "schedule" && <TimeViewPage />}
      </div>
    </div>
  );
}

export default TimeHome;
