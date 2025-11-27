// src/pages/Todo/SharedTodoPage.jsx
import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import CalendarTodo from "../../pages/Todo/CalendarTodo.jsx";
import pageClasses from "../../styles/Todo/TodoPage.module.css";
import headerClasses from "../../styles/Header/todoHeader.module.css";

import { api } from "../../api/http";

const normalize = (d) => {
  if (!d) return null;
  const m = moment(d, moment.ISO_8601, true);
  return m.isValid()
    ? m.startOf("day")
    : moment(d, "YYYY-MM-DD", true).startOf("day");
};

const SharedTodoPage = () => {
  const [rawTasks, setRawTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const itemsPerPage = 10;

  const fetchTodos = async () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const params = new URLSearchParams();

    if (storedUser?.id) {
      params.append("userId", storedUser.id);
    }

    const query = params.toString();
    const pathName = query ? `/api/tasks?${query}` : "/api/tasks";

    try {
      const data = await api.get(pathName);
      setRawTasks(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("? ? ?? ?? ??:", err);
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

  const sharedTasks = useMemo(() => {
    const today = moment().startOf("day");

    let tasks = rawTasks
      .filter((t) => t.shared === true) // ✅ 공유 일정만
      .map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
      .filter((t) => t._m && t._m.isSameOrAfter(today));

    tasks.sort((a, b) => a._m.valueOf() - b._m.valueOf());

    return tasks.map(({ _m, ...rest }) => rest);
  }, [rawTasks]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = sharedTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(sharedTasks.length / itemsPerPage);

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
    <div className={pageClasses.todoPageContainer}>
      <div className={pageClasses.topBar}>
        {/* 🔹 공유 일정 전용 헤더 (기존 CSS 재사용) */}
        <div className={headerClasses.todoHeader}>
          <nav className={headerClasses.todoNav}>
            <button
              className={`${headerClasses.todoBtn} ${headerClasses.active}`}
            >
              공유일정
            </button>
          </nav>
        </div>

        {/* 🔹 TodoPage와 동일한 글작성하기 버튼 추가 */}
        <button
          className={pageClasses.writeButton}
          onClick={() => {
            setEditTodo(null);
            setShowModal(true);
          }}
        >
          글작성하기
        </button>
      </div>

      <div className={pageClasses.taskList}>
        {pagedTasks.length === 0 && (
          <div className={pageClasses.empty}>공유된 일정이 없습니다.</div>
        )}

        {pagedTasks.map((task) => (
          <div
            key={task.id}
            className={pageClasses.taskItem}
            onClick={() => {
              setEditTodo(task);
              setShowModal(true);
            }}
          >
            <h4>{task.title}</h4>
            <p>{task.content}</p>

            <div className={pageClasses.taskDates}>
              <span>작성일: {formatDate(task.createdAt)}</span>
              <span className={pageClasses.dday}>{getDDay(task.promiseDate)}</span>
              <span>약속일: {formatDate(task.promiseDate)}</span>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className={pageClasses.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`${pageClasses.pageBtn} ${
                currentPage === i + 1 ? pageClasses.activePage : ""
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

export default SharedTodoPage;
