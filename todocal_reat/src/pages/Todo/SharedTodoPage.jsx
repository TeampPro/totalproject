import { useState, useEffect, useMemo } from "react";
import moment from "moment";
import ServerBar from "../../components/serverbar/ServerBar.jsx";
import CalendarTodo from "../../pages/Todo/CalendarTodo.jsx";

import pageClasses from "../../styles/Todo/TodoPage.module.css";
import headerClasses from "../../styles/Todo/SharedTodoHeader.module.css";

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
      console.error("공유 일정 불러오기 실패:", err);
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

  // ✅ 공유 일정만 + 오늘 이후만 + 날짜순 정렬
  const sharedTasks = useMemo(() => {
    const today = moment().startOf("day");

    let tasks = rawTasks
      .filter((t) => t.shared === true)
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
    <div className={pageClasses.todoPageOuter}>
      {/* 상단 공통 바 */}
      <ServerBar showBackButton /> {/* 🔹 뒤로가기 버튼 표시 */}

      <div className={pageClasses.todoPageContainer}>
        <div className={pageClasses.topBar}>
          {/* 공유 일정 전용 헤더 */}
          <div className={headerClasses.todoHeader}>
            <nav className={headerClasses.todoNav}>
              <button
                className={`${headerClasses.todoBtn} ${headerClasses.active}`}
                type="button"
              >
                공유 일정
              </button>
            </nav>
          </div>

          {/* 우측 "+ 일정추가" 버튼 */}
          <button
            className={pageClasses.writeButton}
            onClick={() => {
              setEditTodo(null);
              setShowModal(true);
            }}
          >
            + 일정추가
          </button>
        </div>

        {/* 일정 카드 리스트 */}
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
              {/* 상단: 제목 + 내용/장소 + D-day/약속일 */}
              <div className={pageClasses.taskDates}>
                <div className={pageClasses.taskTitleBox}>
                  <h4 className={pageClasses.taskTitle}>{task.title}</h4>
                  {task.content && (
                    <p className={pageClasses.taskContent}>{task.content}</p>
                  )}
                  {task.location && (
                    <p className={pageClasses.taskLocation}>
                      약속 장소 : {task.location}
                    </p>
                  )}
                </div>

                <div className={pageClasses.taskMeta}>
                  <span className={pageClasses.dday}>
                    {getDDay(task.promiseDate)}
                  </span>
                  <span className={pageClasses.promiseDate}>
                    D-day : {formatDateTime(task.promiseDate)}
                  </span>
                </div>
              </div>

              {/* 제목/내용과 하단 사이 구분선 */}
              <div className={pageClasses.taskDivider} />

              {/* 하단: 작성일 */}
              <div className={pageClasses.taskFooter}>
                <span className={pageClasses.createdAt}>
                  작성일 : {formatDate(task.createdDate ?? task.createdAt)}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* 페이지네이션 */}
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

        {/* 모달 (추가/수정) */}
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

export default SharedTodoPage;
