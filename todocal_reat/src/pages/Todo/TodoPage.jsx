import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import TopBar from "../../components/serverbar/ServerBar.jsx";
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

  const formatDateTime = (dateString) =>
    moment(dateString).format("YYYY. MM. DD. HH:mm");

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
      .filter((t) => t.shared !== true); // 공유 일정은 별도 페이지

    if (filter === "week") {
      tasks = tasks.filter((t) =>
        t._m.isBetween(startOfWeek, endOfWeek, null, "[]")
      );
    } else if (filter === "month") {
      tasks = tasks.filter((t) =>
        t._m.isBetween(startOfMonth, endOfMonth, null, "[]")
      );
    }

    tasks.sort((a, b) => a._m.valueOf() - b._m.valueOf());

    return tasks.map(({ _m, ...rest }) => rest);
  }, [rawTasks, filter]);

  const startIdx = (currentPage - 1) * itemsPerPage;
  const pagedTasks = filteredTasks.slice(startIdx, startIdx + itemsPerPage);
  const totalPages = Math.ceil(filteredTasks.length / itemsPerPage);

  // 🔥 CalendarTodo -> TodoPage 저장/삭제 결과 처리
  const handleSaveFromModal = async (result) => {
  // 1) 삭제인 경우: 로컬 state에서 바로 제거
  if (result && result.deleted && result.id) {
    setRawTasks((prev) => prev.filter((t) => t.id !== result.id));
  } else {
    // 2) 생성/수정인 경우: 서버 기준으로 새로 조회
    await fetchTodos();
  }

  setShowModal(false);
  setEditTodo(null);
};

  return (
    <div className={classes.todoPageOuter}>
      {/* 상단 헤더 */}
      <TopBar showBackButton /> {/* 🔹 뒤로가기 버튼 표시 */}

      <div className={classes.todoPageContainer}>
        <div className={classes.topBar}>
          <TodoHeader onChangeFilter={setFilter} active={filter} />

          {/* 우측 "+ 일정추가" 버튼 */}
          <button
            className={classes.writeButton}
            onClick={() => {
              setEditTodo(null);
              setShowModal(true);
            }}
          >
            + 일정추가
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
              {/* 상단: 제목 + D-day/약속일 */}
              <div className={classes.taskDates}>
                <div className={classes.taskTitleBox}>
                  <h4 className={classes.taskTitle}>{task.title}</h4>
                  {task.content && (
                    <p className={classes.taskContent}>{task.content}</p>
                  )}
                  {task.location && (
                    <p className={classes.taskLocation}>
                      약속 장소 : {task.location}
                    </p>
                  )}
                </div>

                <div className={classes.taskMeta}>
                  <span className={classes.dday}>
                    {getDDay(task.promiseDate)}
                  </span>
                  <span className={classes.promiseDate}>
                    D-day : {formatDateTime(task.promiseDate)}
                  </span>
                </div>
              </div>

              {/* 제목/내용과 하단 사이 구분선 */}
              <div className={classes.taskDivider} />

              {/* 하단: 작성일 */}
              <div className={classes.taskFooter}>
                <span className={classes.createdAt}>
                  작성일 : {formatDate(task.createdAt)}
                </span>
                {task.ownerId && (
                  <span className={classes.createdAt}>
                    작성자 : {task.ownerId}
                  </span>
                )}
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
    </div>
  );
};

export default TodoPage;
