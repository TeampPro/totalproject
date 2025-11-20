import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import TodoHeader from "../../components/Header/TodoHeader";
import TaskList from "../../components/TaskList/TaskList";
import CalendarTodo from "../../pages/Todo/CalendarTodo.jsx";
import classes from "../../styles/TodoPage/TodoPage.module.css";

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

  const fetchTodos = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const params = new URLSearchParams();

    if (storedUser?.id) {
      params.append("userId", storedUser.id);
    }

    const query = params.toString();
    const url = query
      ? `http://localhost:8080/api/tasks?${query}`
      : "http://localhost:8080/api/tasks";

    fetch(url)
      .then((res) => res.json())
      .then((data) => setRawTasks(data))
      .catch((err) => console.error(err));
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
      .filter((t) => t._m && t._m.isSameOrAfter(today));

    if (filter === "week") {
      tasks = tasks.filter((t) => t._m.isBetween(startOfWeek, endOfWeek, null, "[]"));
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

  const handleSaveFromModal = (savedTodo) => {
    if (!savedTodo) return;

    if (savedTodo.deleted) {
      setRawTasks((prev) => prev.filter((t) => t.id !== savedTodo.id));
      fetchTodos();
      return;
    }

    setRawTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTodo.id);
      return exists
        ? prev.map((t) => (t.id === savedTodo.id ? savedTodo : t))
        : [...prev, savedTodo];
    });

    fetchTodos();
    setShowModal(false);
    setEditTodo(null);
  };

  return (
    <div className={classes.todoPageContainer}>
      <div className={classes.topBar}>
        <TodoHeader onChangeFilter={setFilter} active={filter} showAddButton={false} />
        <button className={classes.writeButton} onClick={() => { setEditTodo(null); setShowModal(true); }}>
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
            onClick={() => { setEditTodo(task); setShowModal(true); }}
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
              className={`${classes.pageBtn} ${currentPage === i + 1 ? classes.activePage : ""}`}
              onClick={() => setCurrentPage(i + 1)}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {showModal && (
        <CalendarTodo
          onClose={() => { setShowModal(false); setEditTodo(null); }}
          onSave={handleSaveFromModal}
          editTodo={editTodo}
          defaultDate={moment().format("YYYY-MM-DD")}
        />
      )}
    </div>
  );
};

export default TodoPage;
