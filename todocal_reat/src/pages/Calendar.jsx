import { useState, useEffect } from "react";
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

function Calendar() {
  const navigate = useNavigate();
  const [getMoment, setMoment] = useState(moment());
  const [holidays, setHolidays] = useState([]);
  const [todos, setTodos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());

  const today = getMoment;

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
        tDate: toYMD(todo.tDate || todo.date),
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

  // ✅ 날짜별 Todo 필터
  const getTodosForDay = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return todos.filter((t) => t.tDate === formatted);
  };

  // ✅ 공휴일 여부
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

    if (savedTodo.deleted) {
      setTodos((prev) => prev.filter((t) => t.todoId !== savedTodo.todoId));
      setMoment(moment());
      return;
    }

    const normalized = {
      ...savedTodo,
      tDate: moment(savedTodo.tDate).format("YYYY-MM-DD"),
    };

    // ✅ 즉시 반영 (프론트 데이터 우선)
    setTodos((prev) => {
      const exists = prev.some((t) => t.todoId === normalized.todoId);
      return exists
        ? prev.map((t) => (t.todoId === normalized.todoId ? normalized : t))
        : [...prev, normalized];
    });

    // ✅ 서버 동기화는 비동기로 (UI 영향 없음)
    fetchTodos(); // await 제거

    // ✅ 강제 리렌더
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
                        key={todo.todoId || idx}
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
          <span className="thisMonth">{today.format("YYYY년 MM월")}</span>
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
