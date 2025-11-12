import { useState, useEffect, useRef } from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import CalendarTodo from "./CalendarTodo";
import "../styles/Calendar.css";

const toYMD = (d) => {
  if (!d) return null;
  if (typeof d === "string") return moment(d).format("YYYY-MM-DD");
  return moment(d).format("YYYY-MM-DD");
};

function Calendar({ onTodosChange }) {
  const navigate = useNavigate();
  const [getMoment, setMoment] = useState(moment());
  const today = getMoment;

  const [holidays, setHolidays] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(today.year());
  const [selectedMonth, setSelectedMonth] = useState(today.month() + 1);
  const monthPickerRef = useRef(null);

  // ✅ 공휴일 불러오기
  const fetchHolidays = async (year) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/holidays/${year}`);
      setHolidays(res.data);
    } catch (err) {
      console.error("❌ 휴일 불러오기 실패:", err);
    }
  };

  // ✅ Todo 불러오기
  const fetchTodos = async () => {
    try {
      const res = await axios.get("http://localhost:8080/api/todos/all");
      const mapped = res.data.map((todo) => ({
        ...todo,
        tDate: todo.promiseDate
          ? moment(todo.promiseDate).format("YYYY-MM-DD")
          : null,
      }));
      setTodos(mapped);
    } catch (err) {
      console.error("❌ Todo 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchHolidays(today.year());
    fetchTodos();
  }, [today]);

  // ✅ 바깥 클릭 시 month picker 닫기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        monthPickerRef.current &&
        !monthPickerRef.current.contains(e.target)
      ) {
        setShowMonthPicker(false);
      }
    };

    if (showMonthPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMonthPicker]);

  // ✅ 날짜별 Todo 필터
  const getTodosForDay = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return todos.filter((t) => t.tDate === formatted);
  };

  // ✅ 공휴일 관련 함수
  const isHoliday = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return holidays.some((h) => h.date === formatted);
  };

  const getHolidayName = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    const found = holidays.find((h) => h.date === formatted);
    return found ? found.name : "";
  };

  // ✅ 저장 / 수정 / 삭제 후 반영
  const handleSave = async (savedTodo) => {
    if (!savedTodo) return;

    // 🧹 삭제된 일정
    if (savedTodo.deleted) {
      console.log("🧹 삭제된 일정 ID:", savedTodo.id);

      // 즉시 화면에서 제거
      setTodos((prev) => prev.filter((t) => t.id !== savedTodo.id));

      // 하단 목록 새로고침 트리거
      onTodosChange && onTodosChange();

      // 달력 리렌더
      setMoment(moment());
      return;
    }

    // 🟢 추가 / 수정
    const normalized = {
      ...savedTodo,
      tDate: moment(savedTodo.tDate).format("YYYY-MM-DD"),
    };

    // 프론트 즉시 반영
    setTodos((prev) => {
      const exists = prev.some((t) => t.id === normalized.id);
      return exists
        ? prev.map((t) => (t.id === normalized.id ? normalized : t))
        : [...prev, normalized];
    });

    // 서버와 동기화
    fetchTodos();

    // 하단 목록 새로고침 트리거
    onTodosChange && onTodosChange();

    // 강제 리렌더
    setMoment(moment());
  };

  // ✅ 달력 데이터 렌더링
  const calendarArr = () => {
    const startDay = today.clone().startOf("month").startOf("week");
    const endDay = today.clone().endOf("month").endOf("week");
    const day = startDay.clone();
    const calendar = [];

    while (day.isBefore(endDay, "day")) {
      calendar.push(
        <tr key={day.format("YYYY-MM-DD") + "-row"}>
          {Array(7)
            .fill(0)
            .map((_, i) => {
              const current = day.clone();
              day.add(1, "day");

              const isToday =
                moment().format("YYYYMMDD") === current.format("YYYYMMDD");
              const isDiffMonth = current.format("MM") !== today.format("MM");

              let className = "";
              if (i === 0) className = "sunday";
              if (i === 6) className = "saturday";
              if (isDiffMonth) className += " dimmed-date";
              if (isToday) className += " today";
              if (isHoliday(current)) className += " holiday";

              const dayTodos = getTodosForDay(current);

              return (
                <td
                  key={current.format("YYYY-MM-DD")}
                  className={className}
                  onClick={() => setSelectedDate(current)}
                >
                  <span className="day-number">{current.format("D")}</span>

                  {/* 공휴일 표시 */}
                  {!isDiffMonth && isHoliday(current) && (
                    <small className="holiday-name">
                      {getHolidayName(current)}
                    </small>
                  )}

                  {/* Todo 점 표시 */}
                  <div className="todo-dot-container">
                    {dayTodos.slice(0, 3).map((todo, idx) => (
                      <div
                        key={todo.id || idx}
                        className="todo-dot"
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditTodo(todo);
                          setShowModal(true);
                        }}
                      >
                        <div className="todo-tooltip">
                          <strong>{todo.title}</strong>
                          {todo.content && <div>{todo.content}</div>}
                        </div>
                      </div>
                    ))}
                    {dayTodos.length > 3 && (
                      <div className="todo-dot-more">
                        +{dayTodos.length - 3}
                      </div>
                    )}
                  </div>
                </td>
              );
            })}
        </tr>
      );
    }
    return calendar;
  };

  return (
    <>
      <div className="calendar-overlay" onClick={() => navigate("/")}></div>

      <div className="calendar-modal">
        <div className="calendar-control">
          <button onClick={() => setMoment(today.clone().subtract(1, "month"))}>
            ◀
          </button>

          <span
            className="thisMonth clickable"
            onClick={() => setShowMonthPicker((prev) => !prev)}
          >
            {today.format("YYYY년 MM월")}
          </span>

          {showMonthPicker && (
            <div className="month-picker" ref={monthPickerRef}>
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {Array.from({ length: 11 }, (_, i) => 2020 + i).map((y) => (
                  <option key={y} value={y}>
                    {y}년
                  </option>
                ))}
              </select>

              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}월
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  const newDate = moment({
                    year: selectedYear,
                    month: selectedMonth - 1,
                  });
                  setMoment(newDate);
                  setShowMonthPicker(false);
                }}
              >
                이동
              </button>
            </div>
          )}

          <button onClick={() => setMoment(today.clone().add(1, "month"))}>
            ▶
          </button>

          <button
            className="right-btn"
            onClick={() => {
              setEditTodo(null);
              setShowModal(true);
            }}
          >
            +
          </button>
        </div>

        <table>
          <thead>
            <tr className="day-names">
              <th>일</th>
              <th>월</th>
              <th>화</th>
              <th>수</th>
              <th>목</th>
              <th>금</th>
              <th>토</th>
            </tr>
          </thead>
          <tbody>{calendarArr()}</tbody>
        </table>
      </div>

      {showModal && (
        <CalendarTodo
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          editTodo={editTodo}
          defaultDate={selectedDate.format("YYYY-MM-DD")}
        />
      )}
    </>
  );
}

export default Calendar;
