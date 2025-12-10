import Calendar from "../../pages/Todo/Calendar";
import "../../styles/TimeCalendar/TimeHome.css";
import calIcon from "../../assets/cal.svg";

function TimeHome({
  onTodosChange,
  calendarRef,
  onDateSelected,
  disabled,
  user,
  reloadKey,
}) {
  const handleTodosChange = (...args) => {
    onTodosChange && onTodosChange(...args);
  };

  if (!user || disabled) {
    // 로그인 안됐을 때 처리 (있다면)
  }

  return (
    <div className="time-home">
      <div className="time-top-row">
        <img src={calIcon} alt="cal" />
        <div className="time-title">캘린더</div>
      </div>

      <div className="time-content">
        <Calendar
          ref={calendarRef}
          onTodosChange={handleTodosChange}
          reloadKey={reloadKey}
          // ✅ 캘린더에서 날짜 선택 → 부모(MainPage)에게 전달
          onDateSelected={(dateMoment) => {
            onDateSelected && onDateSelected(dateMoment);
          }}
        />
      </div>
    </div>
  );
}

export default TimeHome;
