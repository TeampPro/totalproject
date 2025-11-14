import { useState } from "react";
import moment from "moment";
import "./TimeViewPage.css";

const START_HOUR = 8; // 시작 시간 (8시)
const END_HOUR = 20; // 종료 시간 (20시, 8PM)
const HOUR_HEIGHT = 60; // 1시간당 높이(px)

function TimeViewPage() {
  const [weekStart, setWeekStart] = useState(moment().startOf("week")); // 일요일 기준

  // 한 주 날짜 배열
  const days = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "day")
  );

  // 시간 배열
  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  // 🔹 데모용 이벤트 (나중에 API 데이터로 바꿔도 됨)
  const sampleEvents = [
    {
      id: 1,
      title: "팀 프로젝트 기획 회의",
      start: moment(weekStart).add(2, "day").hour(9).minute(0), // 화 9:00
      end: moment(weekStart).add(2, "day").hour(11).minute(0), // 화 11:00
      color: "#cfe3ff",
    },
    {
      id: 2,
      title: "React API 연동",
      start: moment(weekStart).add(3, "day").hour(13).minute(30), // 수 13:30
      end: moment(weekStart).add(3, "day").hour(15).minute(0), // 수 15:00
      color: "#ffe4cc",
    },
    {
      id: 3,
      title: "DB 검증 및 리포트",
      start: moment(weekStart).add(4, "day").hour(10).minute(0), // 목 10:00
      end: moment(weekStart).add(4, "day").hour(12).minute(0), // 목 12:00
      color: "#e4f7d2",
    },
  ];

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

      {/* 주간 시간표 그리드 */}
      <div className="timeview-grid">
        {/* 상단 요일 헤더 */}
        <div className="timeview-header-row">
          <div className="timeview-time-col-header" />
          {days.map((day) => (
            <div key={day.format("YYYY-MM-DD")} className="timeview-day-header">
              <div className="day-name">{day.format("ddd")}</div>
              <div className="day-date">{day.format("MM/DD")}</div>
            </div>
          ))}
        </div>

        {/* 본문: 좌측 시간 / 우측 요일별 컬럼 */}
        <div className="timeview-body">
          {/* 왼쪽 시간 축 */}
          <div className="timeview-time-col">
            {hours.map((h) => (
              <div key={h} className="timeview-time-cell">
                {h}:00
              </div>
            ))}
          </div>

          {/* 요일별 컬럼 */}
          {days.map((day) => {
            const dayEvents = sampleEvents.filter((e) =>
              e.start.isSame(day, "day")
            );

            return (
              <div key={day.format("YYYY-MM-DD")} className="timeview-day-col">
                {/* 시간 슬롯 라인 */}
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
