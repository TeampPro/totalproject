import { useState, useEffect, useMemo } from "react";
import classes from "../../styles/TodoPage/TodoPage.module.css";
import moment from "moment";
import CalendarTodo from "../../pages/CalendarTodo";

// ⭐ TodoHeader 추가
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

  // ⭐ 글작성 모달
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  // ⭐ 일정 추가 모달 열기
  const handleAddClick = () => setShowModal(true);

  // 서버에서 실제 데이터 fetch
  useEffect(() => {
    // ★ userId 쿼리 추가
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const params = new URLSearchParams();

    if (storedUser && storedUser.id) {
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
  }, []);

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
      tasks = tasks.filter((t) => t.shared === true); // 공유 일정만
    }

    tasks.sort((a, b) => a._m.valueOf() - b._m.valueOf());
    return tasks.map(({ _m, ...rest }) => rest);
  }, [rawTasks, filter]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = filteredTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // ⭐ CalendarTodo 저장 처리
  
  const handleSaveFromModal = (savedTodo) => {
    if (!savedTodo) return;

    // ⭐ savedTodo → rawTasks 형식으로 변환
    const normalized = {
      ...savedTodo,
      tDate: savedTodo.promiseDate
        ? moment(savedTodo.promiseDate).format("YYYY-MM-DD")
        : null,
    };

    // ⭐ 삭제 처리
    if (savedTodo.deleted) {
      setRawTasks((prev) => prev.filter((t) => t.id !== savedTodo.id));
      return;
    }

    // ⭐ 수정/추가 처리
    setRawTasks((prev) => {
      const exists = prev.some((t) => t.id === normalized.id);
      return exists
        ? prev.map((t) => (t.id === normalized.id ? normalized : t))
        : [...prev, normalized];
    });

    setShowModal(false);
    setEditTodo(null);
  };


  return (
    <div className={classes.todoPageContainer}>
<<<<<<< HEAD
      {/* ⭐ TodoHeader + 글작성하기 버튼을 한 줄에 배치 */}
      <div className={classes.topBar}>
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false} // TodoHeader는 + 버튼 숨김
        />

=======
      <div className={classes.todoHeaderContainer}>
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false}
        />
>>>>>>> origin/login
        <button className={classes.writeButton} onClick={handleAddClick}>
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
          </div>
        ))}
      </div>
      {showModal && (
        <CalendarTodo
          onClose={() => {
            setShowModal(false);
            setEditTodo(null);
          }}
          onSave={handleSaveFromModal}
          editTodo={editTodo} // ⭐ 추가됨 (수정 모드 활성화)
          defaultDate={moment().format("YYYY-MM-DD")}
        />
      )}

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
    </div>
  );
};

export default TodoPage;
