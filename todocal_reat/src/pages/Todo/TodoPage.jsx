import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import TodoHeader from "../../components/Header/TodoHeader";
import CalendarTodo from "../../pages/Todo/CalendarTodo.jsx";
import classes from "../../styles/Todo/TodoPage.module.css";
import { api } from "../../api/http";

const normalize = (d) => {
  if (!d) return null;
  const m = moment(d, moment.ISO_8601, true);
  return m.isValid()
    ? m.startOf("day")
    : moment(d, "YYYY-MM-DD", true).startOf("day");
};

const TodoPage = () => {
  const [filter, setFilter] = useState("all");
  const [rawTasks, setRawTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const itemsPerPage = 10;

  const fetchTodos = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");

    if (!storedUser?.id) {
      setRawTasks([]);
      return;
    }

    try {
      const data = await api.get("/api/tasks", {
        params: { userId: storedUser.id },
      });
      setRawTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("❌ 일정 목록 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  const formatDate = (dateString) =>
    moment(dateString).format("YYYY. MM. DD.");

  const getDDay = (date) => {
    const today = moment().startOf("day");
    const target = moment(date).startOf("day");
    const diff = target.diff(today, "days");

    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };

  const filteredTasks = useMemo(() => {
    const today = moment().startOf("day");
    const startOfWeek = moment().startOf("isoWeek");
    const endOfWeek = moment().endOf("isoWeek");
    const startOfMonth = moment().startOf("month");
    const endOfMonth = moment().endOf("month");

    let tasks = rawTasks
      .map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
      .filter((t) => t._m && t._m.isSameOrAfter(today))
      .filter((t) => t.shared !== true); // 공유 일정은 TodoPage에서 제외

    if (filter === "week") {
      tasks = tasks.filter((t) =>
        t._m.isBetween(startOfWeek, endOfWeek, null, "[]")
      );
    } else if (filter === "month") {
      tasks = tasks.filter((t) =>
        t._m.isBetween(startOfMonth, endOfMonth, null, "[]")
      );
    } else if (filter === "shared") {
      tasks = tasks.filter((t) => t.shared === true);
    }

    tasks.sort((a, b) => a._m.valueOf() - b._m.valueOf());

    return tasks.map(({ _m, ...rest }) => rest);
  }, [rawTasks, filter]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = filteredTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // 🔥 CalendarTodo -> TodoPage 저장/삭제 결과 처리
  const handleSaveFromModal = async (savedTodo) => {
    if (!savedTodo) return;
    await fetchTodos(); // 서버 기준 최신 상태 재조회
    setShowModal(false);
    setEditTodo(null);
  };

  return (
    <div className={classes.todoPageContainer}>
      <div className={classes.topBar}>
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false}
        />
        <button
          className={classes.writeButton}
          onClick={() => {
            setEditTodo(null);
            setShowModal(true);
          }}
        >
          글작성하기
        </button>
      </div>

      <div className={classes.taskList}>
        {pagedTasks.length === 0 && (
          <div className={classes.empty}>데이터가 없습니다.</div>
        )}

        {pagedTasks.map((task) => (
          <div
            key={task.id}
            className={classes.taskItem}
            onClick={() => {
              setEditTodo(task);
              setShowModal(true);
            }}
          >
            <h4>{task.title}</h4>
            <p>{task.content}</p>

            <div className={classes.taskDates}>
              <span>작성일: {formatDate(task.createdAt)}</span>
              <span className={classes.dday}>{getDDay(task.promiseDate)}</span>
              <span>약속일: {formatDate(task.promiseDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={classes.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`${classes.pageBtn} ${
                currentPage === i + 1 ? classes.activePage : ""
              }`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <CalendarTodo
          onClose={() => {
            setShowModal(false);
            setEditTodo(null);
          }}
          onSave={handleSaveFromModal}
          editTodo={editTodo}
          defaultDate={moment().format("YYYY-MM-DD")}
        />
      )}
    </div>
  );
};

export default TodoPage;
