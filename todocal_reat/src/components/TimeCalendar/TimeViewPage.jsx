import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import CalendarTodo from "../../pages/Todo/CalendarTodo";
import "../../styles/TimeCalendar/TimeViewPage.css";

const START_HOUR = 8;
const END_HOUR = 20;
const HOUR_HEIGHT = 60;

function TimeViewPage() {
  const [weekStart, setWeekStart] = useState(moment().startOf("week"));
  const [events, setEvents] = useState([]);

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchEvents = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const userId = storedUser?.id || ""; // 로그인 안 했으면 빈 문자열

      const res = await axios.get(
        `http://localhost:8080/api/tasks?userId=${userId}`
      );
      const all = res.data;

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


  useEffect(() => {
    fetchEvents();
  }, [weekStart]);

  const days = Array.from({ length: 7 }, (_, i) =>
    moment(weekStart).add(i, "day")
  );

  const hours = Array.from(
    { length: END_HOUR - START_HOUR },
    (_, i) => START_HOUR + i
  );

  return (
    <div className="timeview-page">
      <header className="timeview-header">
        <div className="timeview-header-left">
          <button
            onClick={() => setWeekStart(moment(weekStart).subtract(1, "week"))}
          >
            ◀
          </button>
          <button onClick={() => setWeekStart(moment().startOf("week"))}>
            Today
          </button>
          <button
            onClick={() => setWeekStart(moment(weekStart).add(1, "week"))}
          >
            ▶
          </button>
        </div>
        <div className="timeview-header-center">
          <h2>
            {weekStart.format("YYYY년 MM월 DD일")} ~{" "}
            {moment(weekStart).add(6, "day").format("MM월 DD일")}
          </h2>
        </div>
      </header>

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

                {dayEvents.map((event) => {
                  const start = moment(event.promiseDate);
                  const end = event.endDateTime
                    ? moment(event.endDateTime)
                    : moment(event.promiseDate).add(1, "hour");

                  const startHour = start.hour() + start.minute() / 60;
                  const endHour = end.hour() + end.minute() / 60;

                  const top = (startHour - START_HOUR) * HOUR_HEIGHT;
                  const height = Math.max(
                    (endHour - startHour) * HOUR_HEIGHT,
                    10
                  );

                  return (
                    <div
                      key={event.id}
                      className="timeview-event"
                      style={{
                        top: `${top}px`,
                        height: `${height}px`,
                        backgroundColor: "#cfe3ff",
                        cursor: "pointer",
                      }}
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowModal(true);
                      }}
                    >
                      <div className="event-time">
                        {start.format("HH:mm")} ~ {end.format("HH:mm")}
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

      {showModal && selectedEvent && (
        <CalendarTodo
          editTodo={selectedEvent}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          onSave={(savedTodo) => {
            // 삭제인 경우
            if (savedTodo?.deleted) {
              setEvents((prev) => prev.filter((e) => e.id !== savedTodo.id));
            } else if (savedTodo) {
              // 추가 또는 수정인 경우
              setEvents((prev) => {
                const exists = prev.some((e) => e.id === savedTodo.id);

                // 이미 있는 일정이면 수정
                if (exists) {
                  return prev.map((e) =>
                    e.id === savedTodo.id ? { ...e, ...savedTodo } : e
                  );
                }

                // 없는 일정이면 새로 추가
                return [...prev, savedTodo];
              });
            }

            setShowModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

export default TimeViewPage;
