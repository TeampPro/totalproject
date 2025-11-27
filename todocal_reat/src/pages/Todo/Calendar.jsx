import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import moment from "moment";
import { useNavigate } from "react-router-dom";
import { api } from "../../api/http";
import CalendarTodo from "./CalendarTodo";
import "../../styles/Todo/Calendar.css";

function Calendar({ onTodosChange }, ref) {
  const navigate = useNavigate();
  const storedUser = JSON.parse(localStorage.getItem("user"));
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
  // 드래그된 Todo 저장용 ref
  const draggedTodoRef = useRef(null);

  // ✅ 외부에서 호출할 "할 일 추가" 함수
  const openAddTodo = (date) => {
    if (!isLoggedIn) {
      alert("로그인이 필요합니다!");
      return;
    }

    // 외부에서 날짜를 넘기면 그 날짜, 아니면 현재 선택된 날짜
    const target = date ? moment(date) : selectedDate || moment();
    setSelectedDate(target);

    setEditTodo(null);
    setShowModal(true);
  };

  // ✅ ref 로 메서드 노출
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
  // ----------------------------
  // Todo ???? (Task ??, userId ??)
  // ----------------------------
  const fetchTodos = async () => {
    if (!isLoggedIn) return;
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));

      const params = {};
      if (storedUser && storedUser.id) {
        params.userId = storedUser.id;
      }

      const data = await api.get("/api/tasks", {
        params,
      });

      const mapped = (data || []).map((todo) => ({
        ...todo,
        tDate: todo.promiseDate
          ? moment(todo.promiseDate).format("YYYY-MM-DD")
          : null,
      }));

      setTodos(mapped);
    } catch (err) {
      console.error("Todo ???? ??:", err);
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

  // ----------------------------
  // 월 선택창 외부 클릭 닫기
  // ----------------------------
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

  // ----------------------------
  // 유틸 함수
  // ----------------------------
  const isHoliday = (date) =>
    holidays.some((h) => h.date === date.format("YYYY-MM-DD"));

  const getHolidayName = (date) => {
    const found = holidays.find((h) => h.date === date.format("YYYY-MM-DD"));
    return found ? found.name : "";
  };

  const getTodosForDay = (date) =>
    todos.filter((t) => t.tDate === date.format("YYYY-MM-DD"));

  // ----------------------------
  // 일정 저장 (추가/수정/삭제) - 서버 호출 X, 상태만 갱신
  // ----------------------------
  const handleSave = (savedTodo) => {
    if (!savedTodo) return;

    // 삭제인 경우: savedTodo = { id, deleted: true }
    if (savedTodo.deleted) {
      setTodos((prev) => prev.filter((t) => t.id !== savedTodo.id));
      onTodosChange && onTodosChange();
      return;
    }

    // 추가/수정인 경우
    const normalized = {
      ...savedTodo,
      tDate: moment(savedTodo.promiseDate ?? savedTodo.tDate).format(
        "YYYY-MM-DD"
      ),
    };

    setTodos((prev) => {
      const idx = prev.findIndex((t) => t.id === normalized.id);
      if (idx === -1) {
        // 새 일정
        return [...prev, normalized];
      }
      // 기존 일정 수정
      const copy = [...prev];
      copy[idx] = normalized;
      return copy;
    });

    onTodosChange && onTodosChange();
  };

  // ----------------------------
  // 드래그 앤 드롭
  // ----------------------------
  const handleDrop = async (todo, newDate) => {
    try {
      const updatedTodo = {
        ...todo,
        promiseDate: `${newDate}T${moment(todo.promiseDate).format(
          "HH:mm:ss"
        )}`,
      };

      await api.put(
        `http://localhost:8080/api/tasks/${todo.id}`,
        updatedTodo
      );

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

  // ----------------------------
  // 달력 생성
  // ----------------------------
  const calendarArr = () => {
    const startDay = today.clone().startOf("month").startOf("week");
    const endDay = today.clone().endOf("month").endOf("week");
    const day = startDay.clone();

    const calendar = [];

    while (day.isBefore(endDay, "day") || day.isSame(endDay, "day")) {
      const current = day.clone();
      const isDiffMonth = current.month() !== today.month();
      const dayTodos = getTodosForDay(current);

      calendar.push(
        <div
          key={current.format("YYYY-MM-DD")}
          className={`day-cell ${isDiffMonth ? "dimmed-date" : ""} ${
            isHoliday(current) ? "holiday" : ""
          }`}
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
          <span className="weekday">{current.format("ddd")}</span>
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

  // ----------------------------
  // 렌더링
  // ----------------------------
  return (
    <>
      {/* 배경 클릭 시 메인으로 이동 */}
      <div className="calendar-overlay" onClick={() => navigate("/")} />

      <div className="calendar-modal">
        {/* 상단 헤더: ◀  YYYY년 MM월  ▶   + */}
        <div className="calendar-header">
          {/* 왼쪽 화살표 */}
          <button
            className="nav-btn left-btn"
            onClick={() => setMoment(today.clone().subtract(1, "month"))}
          >
            ◀
          </button>

          {/* 중앙 년월 */}
          <div
            className="current-year-month"
            onClick={() => setShowMonthPicker((prev) => !prev)}
          >
            {today.format("YYYY년 MM월")}
          </div>

          {/* 오른쪽 화살표 */}
          <button
            className="nav-btn right-btn"
            onClick={() => setMoment(today.clone().add(1, "month"))}
          >
            ▶
          </button>

          {/* 월 선택 드롭메뉴 */}
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

      {/* 하루 일정 모아보기 */}
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

export default forwardRef(Calendar);
