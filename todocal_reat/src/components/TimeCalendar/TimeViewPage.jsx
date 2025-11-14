import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "./TimeViewPage.css";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 60;

function TimeViewPage() {
  const [weekStart, setWeekStart] = useState(moment().startOf("week"));
  const [events, setEvents] = useState([]); // 🔥 DB에서 불러올 일정들

  // 한 주 날짜 배열
  const days = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "day")
  );

  // 시간 배열
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  /** =============================
   *  🔥 일정(DB) 불러오기
   * ============================= */
  useEffect(() => {
    axios
      .get("http://localhost:8080/api/todos/all")
      .then((res) => {
        const converted = res.data
          .filter((t) => t.promiseDate && t.promiseTime)
          .map((t) => {
            const start = moment(
              `${t.promiseDate} ${t.promiseTime}`,
              "YYYY-MM-DD HH:mm"
            );

            // 기본: 1시간짜리 블록
            const end = start.clone().add(1, "hour");

            return {
              id: t.id,
              title: t.title,
              start,
              end,
              color: "#cfe3ff", // 기본 색 (원하면 색 분리 가능)
            };
          });

        setEvents(converted);
      })
      .catch((err) => console.error("❌ 일정 불러오기 실패:", err));
  }, []); // 최초 1회

  /** =============================
   *  🔥 현재 주에 해당하는 일정 필터링
   * ============================= */
  const getEventsForDay = (day) => {
    return events.filter((ev) => ev.start.isSame(day, "day"));
  };

  /** =============================
   *  주 이동 기능
   * ============================= */
  const goPrevWeek = () => setWeekStart(moment(weekStart).subtract(1, "week"));
  const goNextWeek = () => setWeekStart(moment(weekStart).add(1, "week"));
  const goToday = () => setWeekStart(moment().startOf("week"));

  return (
    <div className="timeview-page">
      {/* 상단 헤더 */}
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

      {/* 주간 시간표 */}
      <div className="timeview-grid">
        {/* 요일 헤더 */}
        <div className="timeview-header-row">
          <div className="timeview-time-col-header" />
          {days.map((day) => (
            <div key={day.format("YYYY-MM-DD")} className="timeview-day-header">
              <div className="day-name">{day.format("ddd")}</div>
              <div className="day-date">{day.format("MM/DD")}</div>
            </div>
          ))}
        </div>

        {/* 본문 */}
        <div className="timeview-body">
          {/* 왼쪽 시간 */}
          <div className="timeview-time-col">
            {hours.map((h) => (
              <div key={h} className="timeview-time-cell">
                {h}:00
              </div>
            ))}
          </div>

          {/* 요일별 이벤트 */}
          {days.map((day) => {
            const dayEvents = getEventsForDay(day);

            return (
              <div key={day.format("YYYY-MM-DD")} className="timeview-day-col">
                {/* 시간 칸 */}
                {hours.map((h) => (
                  <div key={h} className="timeview-slot" />
                ))}

                {/* 이벤트 블록 */}
                {dayEvents.map((event) => {
                  const startHour =
                    event.start.hour() + event.start.minute() / 60;
                  const endHour = event.end.hour() + event.end.minute() / 60;

                  const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                  const height = (endHour - startHour) * HOUR_HEIGHT;

                  return (
                    <div
                      key={event.id}
                      className="timeview-event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: event.color,
                      }}
                    >
                      <div className="event-time">
                        {event.start.format("HH:mm")} -{" "}
                        {event.end.format("HH:mm")}
                      </div>
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
