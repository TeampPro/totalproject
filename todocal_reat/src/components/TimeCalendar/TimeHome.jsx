import { useState } from "react";
import Calendar from "../../pages/Todo/Calendar";
import TimeViewPage from "./TimeViewPage";
import "../../styles/TimeCalendar/TimeHome.css";

function TimeHome({ onTodosChange, calendarRef }) {
  const [reloadKey, setReloadKey] = useState(0);

  const handleTodosChange = (...args) => {
    // 상위에서 쓰는 onTodosChange도 그대로 유지
    if (onTodosChange) {
      onTodosChange(...args);
    }
    // ✅ 일정이 바뀔 때마다 키를 하나씩 증가
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="time-home">
      <div className="time-top-row">
        <div className="time-title">📅 캘린더</div>
      </div>

      <div className="time-content">
        {/* 위쪽 캘린더: 변경 콜백 교체 */}
        <Calendar ref={calendarRef} onTodosChange={handleTodosChange} />

        {/* 아래 타임라인: reloadKey 전달 */}
        <div className="timeview-wrapper">
          <TimeViewPage reloadKey={reloadKey} />
        </div>
      </div>
    </div>
  );
}

export default TimeHome;