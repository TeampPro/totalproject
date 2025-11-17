import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "./TimeViewPage.css";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 60;

function TimeViewPage() {
  const [weekStart, setWeekStart] = useState(moment().startOf("week"));
  const [events, setEvents] = useState([]);

  // DB에서 Task 가져오기
  useEffect(() => {
    fetchEvents();
  }, [weekStart]);

  const fetchEvents = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/tasks");
      const all = res.data;

      // 이번주에 해당하는 이벤트만 필터링
      const filtered = all.filter((e) => {
        const d = moment(e.promiseDate);
        return (
          d.isSameOrAfter(weekStart, "day") &&
          d.isSameOrBefore(moment(weekStart).add(6, "day"), "day")
        );
      });

      setEvents(filtered);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  const days = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "day")
  );

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  const goPrevWeek = () => setWeekStart(moment(weekStart).subtract(1, "week"));
  const goNextWeek = () => setWeekStart(moment(weekStart).add(1, "week"));
  const goToday = () => setWeekStart(moment().startOf("week"));

  return (
    <div className="timeview-page">
      {/* 상단 */}
      <header className="timeview-header">
        <div className="timeview-header-left">
          <button onClick={goPrevWeek}>◀</button>
          <button onClick={goToday}>Today</button>
          <button onClick={goNextWeek}>▶</button>
        </div>
        <div className="timeview-header-center">
          <h2>
            {weekStart.format("YYYY년 MM월 DD일")} ~{" "}
            {moment(weekStart).add(6, "day").format("MM월 DD일")}
          </h2>
        </div>
      </header>

      {/* 그리드 */}
      <div className="timeview-grid">
        <div className="timeview-header-row">
          <div className="timeview-time-col-header" />
          {days.map((day) => (
            <div key={day.format("YYYY-MM-DD")} className="timeview-day-header">
              <div className="day-name">{day.format("ddd")}</div>
              <div className="day-date">{day.format("MM/DD")}</div>
            </div>
          ))}
        </div>

        <div className="timeview-body">
          <div className="timeview-time-col">
            {hours.map((h) => (
              <div key={h} className="timeview-time-cell">
                {h}:00
              </div>
            ))}
          </div>

          {days.map((day) => {
            const dayEvents = events.filter((e) =>
              moment(e.promiseDate).isSame(day, "day")
            );

            return (
              <div key={day.format("YYYY-MM-DD")} className="timeview-day-col">
                {hours.map((h) => (
                  <div key={h} className="timeview-slot" />
                ))}

                {/* 이벤트 렌더링 */}
                {dayEvents.map((event) => {
                  const start = moment(event.promiseDate);
                  const startHour = start.hour() + start.minute() / 60;
                  const endHour = startHour + 1; // 1시간 event default

                  const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                  const height = (endHour - startHour) * HOUR_HEIGHT;

                  return (
                    <div
                      key={event.id}
                      className="timeview-event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: "#cfe3ff",
                      }}
                    >
                      <div className="event-time">{start.format("HH:mm")}</div>
                      <div className="event-title">{event.title}</div>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TimeViewPage;
