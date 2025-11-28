import { useState, useEffect } from "react";
import moment from "moment";
import "moment/locale/ko";
import CalendarTodo from "../../pages/Todo/CalendarTodo";
import { api } from "../../api/http";
import "../../styles/TimeCalendar/TimeViewPage.css";

moment.locale("ko");

function TimeViewPage({ reloadKey = 0 }) {
  const [weekStart, setWeekStart] = useState(moment().startOf("week")); // 일요일 시작
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(moment());

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const weekdayShort = ["일", "월", "화", "수", "목", "금", "토"];
  const weekdayFull = [
    "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일",
  ];

  // 현재 weekStart 기준으로 주간 일정 로딩
  const loadWeekEvents = async (baseWeekStart = weekStart) => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!storedUser?.id) {
        setEvents([]);
        return;
      }

      const data = await api.get("/api/tasks", {
        params: { userId: storedUser.id },
      });
      const all = data || [];

      const start = baseWeekStart.clone().startOf("day");
      const end = baseWeekStart.clone().add(6, "day").endOf("day");

      const filtered = all.filter((e) => {
        if (!e.promiseDate) return false;
        const d = moment(e.promiseDate);
        return d.isSameOrAfter(start) && d.isSameOrBefore(end);
      });

      setEvents(filtered);
    } catch (err) {
      console.error("❌ 일정 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    loadWeekEvents(weekStart);
  }, [weekStart, reloadKey]);

  // 주가 바뀔 때 선택일이 범위 밖이면 보정
  useEffect(() => {
    const end = weekStart.clone().add(6, "day");
    if (!selectedDate.isBetween(weekStart, end, "day", "[]")) {
      setSelectedDate(weekStart.clone());
    }
  }, [weekStart, selectedDate]);

  const days = Array.from({ length: 7 }, (_, i) =>
    weekStart.clone().add(i, "day")
  );

  const getEventsForDay = (dayMoment) =>
    events.filter((e) =>
      e.promiseDate ? moment(e.promiseDate).isSame(dayMoment, "day") : false
    );

  const selectedDayEvents = getEventsForDay(selectedDate);

  // 선택된 날짜 요약 정보 계산
  const calcDayStats = () => {
    if (selectedDayEvents.length === 0) {
      return {
        startTime: "-",
        endTime: "-",
        totalDurationText: "0m",
        mostImportantTitle: "-",
      };
    }

    let earliest = null;
    let latest = null;
    let totalMinutes = 0;
    let longest = null;
    let longestMinutes = -1;

    selectedDayEvents.forEach((ev) => {
      const start = ev.promiseDate ? moment(ev.promiseDate) : null;
      const end = ev.endDateTime
        ? moment(ev.endDateTime)
        : start
        ? start.clone().add(1, "hour")
        : null;

      if (!start || !end) return;

      if (!earliest || start.isBefore(earliest)) earliest = start;
      if (!latest || end.isAfter(latest)) latest = end;

      const diff = end.diff(start, "minutes");
      if (diff > 0) {
        totalMinutes += diff;
        if (diff > longestMinutes) {
          longestMinutes = diff;
          longest = ev;
        }
      }
    });

    const totalHours = Math.floor(totalMinutes / 60);
    const remainMinutes = totalMinutes % 60;
    const totalDurationText =
      totalMinutes === 0
        ? "0m"
        : `${totalHours > 0 ? `${totalHours}h ` : ""}${
            remainMinutes > 0 ? `${remainMinutes}m` : ""
          }`;

    const fmt = (m) => (m ? m.format("HH:mm") : "-");

    return {
      startTime: fmt(earliest),
      endTime: fmt(latest),
      totalDurationText,
      mostImportantTitle: longest?.title || "-",
    };
  };

  const dayStats = calcDayStats();

  // 타임라인 데이터 구성
  const buildTimelineData = () => {
    if (selectedDayEvents.length === 0) {
      return { blocks: [], trackHeight: 40 };
    }

    const sorted = [...selectedDayEvents].sort((a, b) =>
      moment(a.promiseDate).diff(moment(b.promiseDate))
    );

    const dayStart = selectedDate.clone().startOf("day");

    const lanesEnd = [];
    const blocks = [];

    sorted.forEach((event) => {
      const startDT = event.promiseDate ? moment(event.promiseDate) : null;
      const endDT = event.endDateTime
        ? moment(event.endDateTime)
        : startDT
        ? startDT.clone().add(1, "hour")
        : null;

      if (!startDT || !endDT) return;

      const startMinutes = Math.max(0, startDT.diff(dayStart, "minutes"));
      const endMinutes = Math.min(
        24 * 60,
        Math.max(startMinutes + 1, endDT.diff(dayStart, "minutes"))
      );

      const startHourNum = startMinutes / 60;
      const endHourNum = endMinutes / 60;

      if (endHourNum <= 0 || startHourNum >= 24 || endHourNum <= startHourNum)
        return;

      let lane = 0;
      while (lane < lanesEnd.length && lanesEnd[lane] > startHourNum) {
        lane++;
      }
      lanesEnd[lane] = endHourNum;

      blocks.push({
        event,
        lane,
        startHourNum,
        endHourNum,
        displayStart: startDT,
        displayEnd: endDT,
      });
    });

    const trackHeight = 40 + Math.max(0, lanesEnd.length - 1) * 36;
    return { blocks, trackHeight };
  };

  const { blocks: timelineBlocks, trackHeight } = buildTimelineData();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  return (
    <div className="tv-page">
      {/* 상단: Today / 화살표 / 주 범위 */}
      <header className="tv-header">
        <div className="tv-header-left">
          <button
            type="button"
            onClick={() => setWeekStart(weekStart.clone().subtract(1, "week"))}
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => {
              const s = moment().startOf("week");
              setWeekStart(s);
              setSelectedDate(moment());
            }}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setWeekStart(weekStart.clone().add(1, "week"))}
          >
            ▶
          </button>
        </div>
        <div className="tv-header-center">
          <h2>
            {weekStart.format("YYYY년 MM월 DD일")} ~{" "}
            {weekStart.clone().add(6, "day").format("MM월 DD일")}
          </h2>
        </div>
      </header>

      {/* 1. 위쪽 주간 바 */}
      <section className="tv-week-strip">
        {days.map((day, idx) => {
          const dayEvents = getEventsForDay(day);
          const isSelected = day.isSame(selectedDate, "day");

          return (
            <div
              key={day.format("YYYY-MM-DD")}
              className={`tv-week-day ${
                isSelected ? "tv-week-day-selected" : ""
              }`}
              onClick={() => setSelectedDate(day)}
            >
              <div
                className={`tv-week-day-header ${
                  idx === 0 ? "tv-week-day-sunday" : ""
                }`}
              >
                <span className="tv-week-day-date">{day.format("D")}</span>
                <span className="tv-week-day-label">
                  {weekdayShort[day.day()]}
                </span>
              </div>

              <div className="tv-week-day-events">
                {dayEvents.map((ev) => {
                  const s = ev.promiseDate ? moment(ev.promiseDate) : null;
                  const e = ev.endDateTime
                    ? moment(ev.endDateTime)
                    : s
                    ? s.clone().add(1, "hour")
                    : null;

                  if (!s || !e) return null;

                  const durationMin = e.diff(s, "minutes");
                  const durationText =
                    durationMin > 0
                      ? `${Math.floor(durationMin / 60)}h ${
                          durationMin % 60
                        }m`
                      : "";

                  return (
                    <div
                      key={ev.id}
                      className="tv-week-event-chip"
                      onClick={(clickEvt) => {
                        clickEvt.stopPropagation();
                        setSelectedEvent(ev);
                        setShowModal(true);
                      }}
                    >
                      {durationText && (
                        <div className="tv-week-event-duration">
                          {durationText}
                        </div>
                      )}
                      <div className="tv-week-event-row">
                        <span className="tv-week-event-time">
                          {s && e
                            ? `${s.format("HH:mm")} ~ ${e.format("HH:mm")}`
                            : ""}
                        </span>
                      </div>
                      <div className="tv-week-event-title">{ev.title}</div>
                    </div>
                  );
                })}

                {dayEvents.length === 0 && (
                  <div className="tv-week-event-empty">일정 없음</div>
                )}
              </div>

              {isSelected && <div className="tv-week-day-pointer" />}
            </div>
          );
        })}
      </section>

      {/* 2. 가운데 요약 + 3. 타임라인 */}
      <section className="tv-summary-box">
        <div className="tv-summary-table">
          <div className="tv-summary-col">
            <div className="tv-summary-label">일정 시작</div>
            <div className="tv-summary-value">{dayStats.startTime}</div>
          </div>
          <div className="tv-summary-col">
            <div className="tv-summary-label">일정 종료</div>
            <div className="tv-summary-value">{dayStats.endTime}</div>
          </div>
          <div className="tv-summary-col">
            <div className="tv-summary-label">총 활동 시간</div>
            <div className="tv-summary-value">
              {dayStats.totalDurationText}
            </div>
          </div>
          <div className="tv-summary-col">
            <div className="tv-summary-label">오늘의 가장 중요한 일정</div>
            <div className="tv-summary-value">
              {dayStats.mostImportantTitle}
            </div>
          </div>
          <div className="tv-summary-col">
            <div className="tv-summary-label">오늘은</div>
            <div className="tv-summary-value">
              {selectedDate.format("YYYY년 MM월 DD일")}{" "}
              {weekdayFull[selectedDate.day()]}입니다.
            </div>
          </div>
        </div>

        <div className="tv-timeline-box">
          <div className="tv-timeline-hours">
            {hours.map((h) => (
              <div key={h} className="tv-timeline-hour">
                {h.toString().padStart(2, "0")}
              </div>
            ))}
          </div>

          <div
            className="tv-timeline-track"
            style={{ height: `${trackHeight}px` }}
          >
            {timelineBlocks.map((b) => {
              const left = (b.startHourNum / 24) * 100;
              const width = ((b.endHourNum - b.startHourNum) / 24) * 100;
              const top = 4 + b.lane * 36;

              return (
                <div
                  key={b.event.id}
                  className="tv-timeline-event"
                  style={{ left: `${left}%`, width: `${width}%`, top }}
                  onClick={() => {
                    setSelectedEvent(b.event);
                    setShowModal(true);
                  }}
                >
                  <div className="tv-timeline-event-title">
                    {b.event.title}
                  </div>
                  <div className="tv-timeline-event-time">
                    {b.displayStart.format("HH:mm")} ~{" "}
                    {b.displayEnd.format("HH:mm")}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="tv-legend">
          <span className="tv-legend-item tv-legend-my">나의 일정</span>
          <span className="tv-legend-item tv-legend-etc">일정 외 시간</span>
          <span className="tv-legend-item tv-legend-share">공유된 일정</span>
          <span className="tv-legend-item tv-legend-emergency">
            긴급 일정
          </span>
          <span className="tv-legend-item tv-legend-holiday">휴가</span>
        </div>
      </section>

      {/* 일정 수정 / 삭제 모달 */}
      {showModal && selectedEvent && (
        <CalendarTodo
          editTodo={selectedEvent}
          defaultDate={selectedDate.format("YYYY-MM-DD")}
          onClose={() => {
            setShowModal(false);
            setSelectedEvent(null);
          }}
          onSave={async () => {
            await loadWeekEvents(weekStart); // 서버 기준 재조회
            setShowModal(false);
            setSelectedEvent(null);
          }}
        />
      )}
    </div>
  );
}

export default TimeViewPage;
    ``