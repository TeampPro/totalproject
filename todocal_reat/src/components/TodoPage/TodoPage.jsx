import { useState, useEffect, useMemo } from "react";
import classes from "../../styles/TodoPage/TodoPage.module.css";
import moment from "moment";
import CalendarTodo from "../../pages/CalendarTodo";
import TodoHeader from "../Header/TodoHeader";

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
  const itemsPerPage = 10;

  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  // 날짜 변환 함수
  const formatDate = (dateString) => {
    return moment(dateString).format("YYYY. MM. DD.");
  };

  const getDDay = (date) => {
    const today = moment().startOf("day");
    const target = moment(date).startOf("day");
    const diff = target.diff(today, "days");

    if (diff === 0) return "D-Day";
    if (diff > 0) return `D-${diff}`;
    return `D+${Math.abs(diff)}`;
  };
  
  // 일정 추가 버튼
  const handleAddClick = () => {
    setEditTodo(null);
    setShowModal(true);
  };

  // 일정 불러오기
  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then((res) => res.json())
      .then((data) => setRawTasks(data))
      .catch((err) => console.error(err));
  }, []);

  // 필터링
  const filteredTasks = useMemo(() => {
    const today = moment().startOf("day");
    const startOfWeek = moment().startOf("isoWeek").startOf("day");
    const endOfWeek = moment().endOf("isoWeek").endOf("day");
    const startOfMonth = moment().startOf("month").startOf("day");
    const endOfMonth = moment().endOf("month").endOf("day");

    let tasks = rawTasks
      .map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
      .filter((t) => t._m && t._m.isSameOrAfter(today));

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

  // 페이지네이션
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = filteredTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // 일정 저장/수정/삭제 반영
  const handleSaveFromModal = (savedTodo) => {
    if (!savedTodo) return;

    if (savedTodo.deleted) {
      setRawTasks((prev) => prev.filter((t) => t.id !== savedTodo.id));
      return;
    }

    setRawTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTodo.id);
      return exists
        ? prev.map((t) => (t.id === savedTodo.id ? savedTodo : t))
        : [...prev, savedTodo];
    });

    setShowModal(false);
    setEditTodo(null);
  };

  return (
    <div className={classes.todoPageContainer}>
      {/* 상단 필터 + 작성 버튼 */}
      <div className={classes.topBar}>
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false}
        />

        <button className={classes.writeButton} onClick={handleAddClick}>
          글작성하기
        </button>
      </div>

      {/* 리스트 */}
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

            {/* 날짜 표시 영역 */}
            <div className={classes.taskDates}>
              <span className={classes.createdAt}>
                작성일: {formatDate(task.createdAt)}
              </span>

              <span className={classes.dday}>{getDDay(task.promiseDate)}</span>

              <span className={classes.promiseDate}>
                약속일: {formatDate(task.promiseDate)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* 페이지네이션 */}
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

      {/* 일정 추가/수정 모달 */}
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
