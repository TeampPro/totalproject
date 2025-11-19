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
  const [dayModalTodos, setDayModalTodos] = useState(null);

  // 공휴일 불러오기
  const fetchHolidays = async (year) => {
    try {
      const res = await axios.get(`http://localhost:8080/api/holidays/${year}`);
      setHolidays(res.data);
    } catch (err) {
      console.error("❌ 휴일 불러오기 실패:", err);
    }
  };

  // ★ Todo 불러오기 (userId 기준)
  const fetchTodos = async () => {
    try {
<<<<<<< HEAD
      const res = await axios.get("http://localhost:8080/api/tasks");
=======
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const params = new URLSearchParams();

      if (storedUser && storedUser.id) {
        params.append("userId", storedUser.id);
      }

      const query = params.toString();
      const url = query
        ? `http://localhost:8080/api/todos/all?${query}`
        : "http://localhost:8080/api/todos/all";

      const res = await axios.get(url);
>>>>>>> origin/login
      const mapped = res.data.map((todo) => ({
        ...todo,
        tDate: todo.promiseDate
          ? moment(todo.promiseDate).format("YYYY-MM-DD")
          : null,
      }));
      setTodos(mapped);
    } catch (err) {
      console.error("❌ Task 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchHolidays(today.year());
    fetchTodos();
  }, [today]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (monthPickerRef.current && !monthPickerRef.current.contains(e.target)) {
        setShowMonthPicker(false);
      }
    };
    if (showMonthPicker)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMonthPicker]);

  const isHoliday = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return holidays.some((h) => h.date === formatted);
  };

  const getHolidayName = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    const found = holidays.find((h) => h.date === formatted);
    return found ? found.name : "";
  };

  const getTodosForDay = (date) => {
    const formatted = date.format("YYYY-MM-DD");
    return todos.filter((t) => t.tDate === formatted);
  };

  const handleSave = async (savedTodo) => {
    if (!savedTodo) return;

    if (savedTodo.deleted) {
      setTodos((prev) => prev.filter((t) => t.id !== savedTodo.id));
      onTodosChange && onTodosChange();
      setMoment(moment());
      return;
    }

    const normalized = {
      ...savedTodo,
      tDate: moment(savedTodo.tDate).format("YYYY-MM-DD"),
    };

    setTodos((prev) => {
      const exists = prev.some((t) => t.id === normalized.id);
      return exists
        ? prev.map((t) => (t.id === normalized.id ? normalized : t))
        : [...prev, normalized];
    });

    fetchTodos();
    onTodosChange && onTodosChange();
    setMoment(moment());
  };

  const calendarArr = () => {
    const startDay = today.clone().startOf("month").startOf("week");
    const endDay = today.clone().endOf("month").endOf("week");
    const day = startDay.clone();
    const calendar = [];

    while (day.isBefore(endDay, "day")) {
      const current = day.clone();
      const isToday = moment().isSame(current, "day");
      const isDiffMonth = current.month() !== today.month();
      const dayTodos = getTodosForDay(current);

      calendar.push(
        <div
          key={current.format("YYYY-MM-DD")}
          className={`day-cell 
            ${isDiffMonth ? "dimmed-date" : ""} 
            ${isToday ? "today" : ""} 
            ${!isDiffMonth && isHoliday(current) ? "holiday" : ""}`
          }
          onClick={() => setSelectedDate(current)}
        >
          <span className="weekday">{current.format("ddd")}</span>
          <span className="date-number">{current.format("D")}</span>

          {!isDiffMonth && isHoliday(current) && (
            <small className="holiday-name">{getHolidayName(current)}</small>
          )}

          <div className="todo-list">
            {dayTodos.slice(0, 2).map((todo, idx) => (
              <div
                key={todo.id || idx}
                className="todo-item"
                title={todo.title}
                onClick={(e) => {
                  e.stopPropagation();
                  setEditTodo(todo);
                  setShowModal(true);
                }}
              >
                {todo.title}
              </div>
            ))}

            {dayTodos.length > 2 && (
              <div
                className="todo-more"
                onClick={(e) => {
                  e.stopPropagation();
                  setDayModalTodos({
                    date: current.format("YYYY-MM-DD"),
                    list: dayTodos,
                  });
                }}
              >
                +{dayTodos.length - 2}
              </div>
            )}
          </div>
        </div>
      );
      day.add(1, "day");
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

        <div className="calendar-grid">{calendarArr()}</div>
      </div>

      {showModal && (
        <CalendarTodo
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          editTodo={editTodo}
          defaultDate={selectedDate.format("YYYY-MM-DD")}
        />
      )}

      {dayModalTodos && (
        <div
          className="todo-day-modal-overlay"
          onClick={() => setDayModalTodos(null)}
        >
          <div className="todo-day-modal" onClick={(e) => e.stopPropagation()}>
            <h3>
              {dayModalTodos.date} 일정 ({dayModalTodos.list.length}개)
            </h3>
            <ul>
              {dayModalTodos.list.map((todo) => (
                <li
                  key={todo.id}
                  onClick={() => {
                    setEditTodo(todo);
                    setShowModal(true);
                    setDayModalTodos(null);
                  }}
                >
                  {todo.title}
                </li>
              ))}
            </ul>
            <button onClick={() => setDayModalTodos(null)}>닫기</button>
          </div>
        </div>
      )}
    </>
  );
}

export default Calendar;
