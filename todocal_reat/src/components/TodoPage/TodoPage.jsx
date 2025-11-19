import { useState, useEffect, useMemo } from "react";
import TodoHeader from "../Header/TodoHeader.jsx";
import TaskList from "../TaskList/TaskList";
import classes from "../../styles/TodoPage/TodoPage.module.css";
import moment from "moment";
<<<<<<< HEAD
=======
import CalendarTodo from "../../pages/CalendarTodo";
import TodoHeader from "../Header/TodoHeader";
import Calendar from "../../pages/Calendar";
>>>>>>> origin/feature/develop

const normalize = (d) => {
  if (!d) return null;
  const m = moment(d, moment.ISO_8601, true);
  return m.isValid() ? m.startOf("day") : moment(d, "YYYY-MM-DD", true).startOf("day");
};

const TodoPage = () => {
  const [filter, setFilter] = useState("all");
  const [rawTasks, setRawTasks] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

<<<<<<< HEAD
<<<<<<< HEAD
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
=======
  const [showModal, setShowModal] = useState(false);
  const [editTodo, setEditTodo] = useState(null);

  const handleAddClick = () => setShowModal(true);

  const fetchTodos = () => {
=======
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
>>>>>>> origin/feature/todo
    fetch("http://localhost:8080/api/tasks")
>>>>>>> origin/feature/develop
      .then((res) => res.json())
      .then((data) => setRawTasks(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => { fetchTodos(); }, []);

  // 필터링
  const filteredTasks = useMemo(() => {
    const today = moment().startOf("day");
    const startOfWeek = moment().startOf("isoWeek").startOf("day");
    const endOfWeek = moment().endOf("isoWeek").endOf("day");
    const startOfMonth = moment().startOf("month").startOf("day");
    const endOfMonth = moment().endOf("month").endOf("day");

<<<<<<< HEAD
    let tasks = rawTasks
      .map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
      .filter((t) => t._m && t._m.isSameOrAfter(today)); // 오늘 이전 제외

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
=======
    let tasks = rawTasks.map((t) => ({ ...t, _m: normalize(t.promiseDate) }))
                        .filter((t) => t._m && t._m.isSameOrAfter(today));

    if (filter === "week") tasks = tasks.filter((t) => t._m.isBetween(startOfWeek,endOfWeek,null,"[]"));
    else if (filter === "month") tasks = tasks.filter((t) => t._m.isBetween(startOfMonth,endOfMonth,null,"[]"));
    else if (filter === "shared") tasks = tasks.filter((t) => t.shared === true);
>>>>>>> origin/feature/develop

    tasks.sort((a,b) => a._m.valueOf() - b._m.valueOf());
    return tasks.map(({ _m,...rest }) => rest);
  }, [rawTasks, filter]);

  // 페이지네이션
  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = filteredTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

<<<<<<< HEAD
<<<<<<< HEAD
  const handleAddClick = () => {
    alert("일정 추가 모달 띄우기 (캘린더 스타일)");
=======
  const handleSaveFromModal = (savedTodo) => {
    if (!savedTodo) return;
    const normalized = {
      ...savedTodo,
      tDate: savedTodo.promiseDate ? moment(savedTodo.promiseDate).format("YYYY-MM-DD") : null,
    };
=======
  // 일정 저장/수정/삭제 반영
  const handleSaveFromModal = (savedTodo) => {
    if (!savedTodo) return;

>>>>>>> origin/feature/todo
    if (savedTodo.deleted) {
      setRawTasks((prev) => prev.filter((t) => t.id !== savedTodo.id));
      fetchTodos(); return;
    }
<<<<<<< HEAD
    setRawTasks((prev) => {
      const exists = prev.some((t) => t.id === normalized.id);
      return exists ? prev.map((t) => (t.id === normalized.id ? normalized : t)) : [...prev, normalized];
=======

    setRawTasks((prev) => {
      const exists = prev.some((t) => t.id === savedTodo.id);
      return exists
        ? prev.map((t) => (t.id === savedTodo.id ? savedTodo : t))
        : [...prev, savedTodo];
>>>>>>> origin/feature/todo
    });
    fetchTodos();
    setShowModal(false); setEditTodo(null);
>>>>>>> origin/feature/develop
  };

  return (
    <div className={classes.todoPageContainer}>
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
      {/* ⭐ TodoHeader + 글작성하기 버튼을 한 줄에 배치 */}
=======
      {/* 상단 필터 + 작성 버튼 */}
>>>>>>> origin/feature/todo
      <div className={classes.topBar}>
=======
      <div className={classes.todoHeaderContainer}>
>>>>>>> origin/login
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false}
        />
<<<<<<< HEAD

=======
      <div className={classes.todoHeaderContainer}>
        <TodoHeader
          onChangeFilter={setFilter}
          active={filter}
          showAddButton={false}
        />
>>>>>>> origin/login
=======
>>>>>>> origin/login
        <button className={classes.writeButton} onClick={handleAddClick}>
          글작성하기
        </button>
      </div>

=======
      <div className={classes.topBar}>
        <TodoHeader onChangeFilter={setFilter} active={filter} showAddButton={false} />
        <button className={classes.writeButton} onClick={handleAddClick}>글작성하기</button>
      </div>

      <Calendar onTodosChange={fetchTodos} />

>>>>>>> origin/feature/develop
      <div className={classes.taskList}>
<<<<<<< HEAD
        {pagedTasks.length === 0 && <div className={classes.empty}>데이터가 없습니다.</div>}
=======
        {pagedTasks.length === 0 && (
          <div className={classes.empty}>데이터가 없습니다.</div>
        )}

>>>>>>> origin/feature/todo
        {pagedTasks.map((task) => (
<<<<<<< HEAD
          <div key={task.id} className={classes.taskItem}>
=======
          <div
            key={task.id}
            className={classes.taskItem}
            onClick={() => { setEditTodo(task); setShowModal(true); }}
          >
>>>>>>> origin/feature/develop
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
<<<<<<< HEAD
<<<<<<< HEAD
=======

      {showModal && (
        <CalendarTodo
          onClose={() => { setShowModal(false); setEditTodo(null); }}
          onSave={handleSaveFromModal}
          editTodo={editTodo}
          defaultDate={moment().format("YYYY-MM-DD")}
        />
      )}
>>>>>>> origin/feature/develop
=======
>>>>>>> origin/feature/todo

      {totalPages > 1 && (
        <div className={classes.pagination}>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i+1}
              className={`${classes.pageBtn} ${currentPage===i+1?classes.activePage:""}`}
              onClick={()=>setCurrentPage(i+1)}
            >{i+1}</button>
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
