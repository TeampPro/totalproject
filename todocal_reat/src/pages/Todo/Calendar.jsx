// src/pages/Todo/Calendar.jsx
import {
  useState,
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import moment from "moment";
import "moment/locale/ko";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import CalendarTodo from "./CalendarTodo";
import "../../styles/Todo/Calendar.css";

// moment 한국어 설정
moment.locale("ko");

const WEEKDAYS_LONG = [
  "일요일",
  "월요일",
  "화요일",
  "수요일",
  "목요일",
  "금요일",
  "토요일",
];

function Calendar({ onTodosChange }, ref) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!storedUser;

  // 현재 보고 있는 달
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
  const draggedTodoRef = useRef(null);

  // ✅ 외부에서 호출할 "할 일 추가" 함수 (ref로 노출)
  const openAddTodo = (date) => {
    if (!isLoggedIn) {
      if (
        window.confirm("로그인이 필요한 기능입니다.\n로그인 페이지로 이동할까요?")
      ) {
        navigate("/login");
      }
      return;
    }

    const target = date ? moment(date) : selectedDate || moment();
    setSelectedDate(target);

    setEditTodo(null);
    setShowModal(true);
  };

  // ref에 메서드 공개
  useImperativeHandle(ref, () => ({
    openAddTodo,
  }));

  // ----------------------------
  // 공휴일 불러오기
  // ----------------------------
  const fetchHolidays = async (year, retry = false) => {
    try {
      const data = await api.get(`/api/holidays/${year}`);
      setHolidays(Array.isArray(data) ? data : []);
    } catch (err) {
      if (!retry && (err?.status === 401 || err?.status === 403)) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        return fetchHolidays(year, true);
      }
      console.error("공휴일 불러오기 실패:", err);
    }
  };

  // ----------------------------
  // Todo 불러오기 (Task 기반, userId 필터)
  // ----------------------------
  const fetchTodos = async () => {
    if (!isLoggedIn) return;
    try {
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");

      const params = {};
      if (savedUser && savedUser.id) {
        params.userId = savedUser.id;
      }

      const data = await api.get("/api/tasks", { params });

      const mapped = (data || []).map((todo) => ({
        ...todo,
        tDate: todo.promiseDate
          ? moment(todo.promiseDate).format("YYYY-MM-DD")
          : null,
      }));

      setTodos(mapped);
    } catch (err) {
      console.error("Todo 불러오기 실패:", err);
    }
  };

  // ----------------------------
  // 최초 로딩: 공휴일 + Todo
  // ----------------------------
  useEffect(() => {
    fetchHolidays(today.year());
    if (isLoggedIn) {
      fetchTodos();
    }
  }, [today, isLoggedIn]);

  // 월 선택창 외부 클릭 닫기
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
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showMonthPicker]);

  const isHoliday = (date) =>
    holidays.some((h) => h.date === date.format("YYYY-MM-DD"));

  const getHolidayName = (date) => {
    const found = holidays.find((h) => h.date === date.format("YYYY-MM-DD"));
    return found ? found.name : "";
  };

  const getTodosForDay = (date) =>
    todos.filter((t) => t.tDate === date.format("YYYY-MM-DD"));

  const handleSave = (savedTodo) => {
    if (!savedTodo) return;

    if (savedTodo.deleted) {
      setTodos((prev) => prev.filter((t) => t.id !== savedTodo.id));
      onTodosChange && onTodosChange();
      return;
    }

    const normalized = {
      ...savedTodo,
      tDate: moment(savedTodo.promiseDate ?? savedTodo.tDate).format(
        "YYYY-MM-DD"
      ),
    };

    setTodos((prev) => {
      const idx = prev.findIndex((t) => t.id === normalized.id);
      if (idx === -1) return [...prev, normalized];
      const copy = [...prev];
      copy[idx] = normalized;
      return copy;
    });

    onTodosChange && onTodosChange();
  };

  const handleDrop = async (todo, newDate) => {
    try {
      const updatedTodo = {
        ...todo,
        promiseDate: `${newDate}T${moment(todo.promiseDate).format(
          "HH:mm:ss"
        )}`,
      };

      await api.put(`/api/tasks/${todo.id}`, updatedTodo);

      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...updatedTodo, tDate: newDate } : t
        )
      );

      onTodosChange && onTodosChange();
    } catch (err) {
      console.error("드래그앤드롭 저장 실패:", err);
    }
  };

  // 달력 생성
  const calendarArr = () => {
    const startDay = today.clone().startOf("month").startOf("week");
    const endDay = today.clone().endOf("month").endOf("week");
    const day = startDay.clone();

    const calendar = [];

    while (day.isBefore(endDay, "day") || day.isSame(endDay, "day")) {
      const current = day.clone();
      const isDiffMonth = current.month() !== today.month();
      const dayTodos = getTodosForDay(current);
      const isSelected = current.isSame(selectedDate, "day");

      calendar.push(
        <div
          key={current.format("YYYY-MM-DD")}
          className={`day-cell ${isDiffMonth ? "dimmed-date" : ""} ${
            isHoliday(current) ? "holiday" : ""
          } ${isSelected ? "selected-day" : ""}`}
          onClick={() => setSelectedDate(current)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={async () => {
            if (draggedTodoRef.current) {
              await handleDrop(
                draggedTodoRef.current,
                current.format("YYYY-MM-DD")
              );
              draggedTodoRef.current = null;
            }
          }}
        >
          <span className="date-number">{current.format("D")}</span>

          {!isDiffMonth && isHoliday(current) && (
            <small className="holiday-name">{getHolidayName(current)}</small>
          )}

          <div className="todo-list">
            {dayTodos.slice(0, 2).map((todo) => (
              <div
                key={todo.id}
                className="todo-item"
                draggable
                onDragStart={() => (draggedTodoRef.current = todo)}
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

  const headerText = `${today.format("YYYY년 MM월 DD일")} ${
    WEEKDAYS_LONG[today.day()]
  }`;

  return (
    <div className="calendar-page">
      <div className="calendar-card">
        {/* 상단 헤더 */}
        <div className="calendar-header">
          <button
            className="nav-btn left-btn"
            onClick={() => setMoment(today.clone().subtract(1, "month"))}
          >
            ◀
          </button>

          <div
            className="current-year-month"
            onClick={() => setShowMonthPicker((prev) => !prev)}
          >
            {headerText}
          </div>

          <button
            className="nav-btn right-btn"
            onClick={() => setMoment(today.clone().add(1, "month"))}
          >
            ▶
          </button>

          {/* 월 선택 드롭다운 */}
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
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {m}월
                  </option>
                ))}
              </select>

              <button
                onClick={() => {
                  setMoment(
                    moment({ year: selectedYear, month: selectedMonth - 1 })
                  );
                  setShowMonthPicker(false);
                }}
              >
                이동
              </button>
            </div>
          )}
        </div>

        {/* 메인 캘린더 */}
        <div className="calendar-grid">{calendarArr()}</div>
      </div>

      {/* 일정 작성 / 수정 모달 */}
      {showModal && (
        <CalendarTodo
          onClose={() => setShowModal(false)}
          onSave={handleSave}
          editTodo={editTodo}
          defaultDate={selectedDate.format("YYYY-MM-DD")}
        />
      )}

      {/* 하루 일정 모아보기 모달 */}
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
    </div>
  );
}

// ✅ ref 사용 가능하게 내보내기
export default forwardRef(Calendar);
