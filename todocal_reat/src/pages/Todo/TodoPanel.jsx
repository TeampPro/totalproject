import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/setupAxios";
import "../../styles/Todo/TodoPanel.css";
import TodoIcon from "../../assets/TodoIcon.svg";
import CalIcon from "../../assets/calIcon.svg";

function TodoPanel({ user, onAddTodo, reloadKey, onTodoUpdated, onTodoDeleted }) {
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!(user?.id || storedUser?.id);

  // D-Day 텍스트 계산
  const getDDayText = (dateTimeString) => {
    if (!dateTimeString) return "";

    const target = new Date(dateTimeString);
    const today = new Date();

    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = target - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-Day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  const ensureLogin = () => {
    if (isLoggedIn) return true;

    if (
      window.confirm(
        "로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?"
      )
    ) {
      navigate("/login");
    }
    return false;
  };

  // ✅ Todo 리스트 조회
  const fetchTodos = async () => {
    try {
      const params = {};
      if (storedUser?.id) params.userId = storedUser.id;

      const res = await axios.get("/api/tasks", {
        params,
      });

      const list = Array.isArray(res.data) ? res.data : [];
      const myId = storedUser?.id;

      const filtered = list.filter((t) => {
        if (!myId) return t.shared === true;
        if (t.ownerId && t.ownerId === myId) return true;
        if (t.shared === true && !t.ownerId) return true;
        return false;
      });

      filtered.sort(
        (a, b) =>
          new Date(a.promiseDate).getTime() - new Date(b.promiseDate).getTime()
      );

      setTodos(filtered);
    } catch (err) {
      console.error("❌ Todo 패널 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, isLoggedIn]);

  // ✅ 진행/완료 토글
  const handleToggleStatus = async (todo) => {
    if (!ensureLogin()) return;

    const currentUserId = user?.id || storedUser?.id;
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    try {
      const nextCompleted = !todo.completed;

      const res = await axios.patch(
        `/api/tasks/${todo.id}/complete`,
        null,
        {
          params: {
            userId: currentUserId,
            completed: nextCompleted,
          },
        }
      );

      const updated = res.data;

      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));

      // 🔁 메인페이지에 "이 일정이 이렇게 바뀌었다" 알리기
      if (onTodoUpdated) {
        onTodoUpdated(updated);
      }
    } catch (err) {
      console.error("✅ 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 일정 삭제
  const handleDeleteTodo = async (todo) => {
    if (!ensureLogin()) return;

    const currentUserId = user?.id || storedUser?.id;
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    if (!window.confirm("해당 일정을 삭제하시겠습니까?")) {
      return;
    }

    try {
      await axios.delete(`/api/tasks/${todo.id}`, {
        params: {
          userId: currentUserId,
        },
      });

      setTodos((prev) => prev.filter((t) => t.id !== todo.id));

      // 🔁 메인페이지에 "이 일정이 삭제됐다" 알리기
      if (onTodoDeleted) {
        onTodoDeleted(todo.id);
      }
    } catch (err) {
      console.error("❌ 일정 삭제 실패:", err);
      alert("일정 삭제 중 오류가 발생했습니다.");
    }
  };

  const handleClickAdd = () => {
    if (!ensureLogin()) return;
    if (onAddTodo) onAddTodo();
  };

  // ------------ 목록/카운트 로직 ------------
  const inProgressTodos = todos.filter((t) => !t.completed);
  const doneTodos = todos.filter((t) => t.completed);

  const MAX_IN_PROGRESS_VISIBLE = 3;
  const MAX_DONE_VISIBLE = 2;

  const inProgressVisible = inProgressTodos.slice(0, MAX_IN_PROGRESS_VISIBLE);
  const inProgressHiddenCount = Math.max(
    0,
    inProgressTodos.length - MAX_IN_PROGRESS_VISIBLE
  );
  const inProgressPlaceholderCount = Math.max(
    0,
    MAX_IN_PROGRESS_VISIBLE - inProgressVisible.length
  );

  const doneVisible = doneTodos.slice(0, MAX_DONE_VISIBLE);
  const doneHiddenCount = Math.max(0, doneTodos.length - MAX_DONE_VISIBLE);
  const donePlaceholderCount = Math.max(
    0,
    MAX_DONE_VISIBLE - doneVisible.length
  );

  // 🔹 비로그인 뷰
  if (!isLoggedIn) {
    return (
      <aside className="todo-panel todo-panel-guest">
        <div className="todo-panel-header">
          <div className="todo-panel-header-left">
            <img src={TodoIcon} alt="할 일 아이콘" className="todo-panel-icon" />
            <div>
              <h2 className="todo-panel-title">할 일 목록</h2>
              <p className="todo-panel-subtitle">
                로그인 후 일정을 관리해보세요.
              </p>
            </div>
          </div>
        </div>

        <section className="todo-guest-section">
          <div className="todo-guest-section-header">
            <span className="todo-guest-section-title">진행중</span>
            <span className="todo-guest-section-count">(2)</span>
          </div>
          <div className="todo-guest-card">
            <div className="todo-guest-row">
              <input type="checkbox" disabled className="todo-guest-checkbox" />
              <div className="todo-guest-main">
                <p className="todo-guest-text">오늘의 중요한 일정을 등록해보세요.</p>
                <span className="todo-guest-badge">D-1</span>
              </div>
            </div>
            <div className="todo-guest-row">
              <input type="checkbox" disabled className="todo-guest-checkbox" />
              <div className="todo-guest-main">
                <p className="todo-guest-text">
                  친구와 공유할 일정을 같이 관리할 수 있어요.
                </p>
                <span className="todo-guest-badge">D-3</span>
              </div>
            </div>
          </div>
        </section>

        <section className="todo-guest-section todo-guest-section-done">
          <div className="todo-guest-section-header">
            <span className="todo-guest-section-title">완료</span>
            <span className="todo-guest-section-count">(1)</span>
          </div>
          <div className="todo-guest-card">
            <div className="todo-guest-row">
              <input
                type="checkbox"
                checked
                readOnly
                disabled
                className="todo-guest-checkbox"
              />
              <div className="todo-guest-main">
                <span className="todo-guest-text todo-guest-text-done">
                  Planix 접속하기
                </span>
                <span className="todo-guest-badge">완료</span>
              </div>
            </div>
          </div>
        </section>

        <section className="todo-guest-login-section">
          <div className="todo-guest-card">
            <div className="todo-guest-row">
              <input type="checkbox" disabled className="todo-guest-checkbox" />
              <div className="todo-guest-main">
                <p className="todo-guest-text">
                  로그인 후 다양한 기능들을 사용해보세요!
                </p>
                <button
                  type="button"
                  className="todo-guest-login-btn"
                  onClick={ensureLogin}
                >
                  Planix 로그인
                </button>
              </div>
            </div>
          </div>
        </section>
      </aside>
    );
  }

  // 🔹 로그인 뷰
  return (
    <aside className="todo-panel">
      <div className="todo-panel-header">
        <div className="todo-panel-header-left">
          <img src={TodoIcon} alt="할 일 아이콘" className="todo-panel-icon" />
          <div>
            <h2 className="todo-panel-title">할 일 목록</h2>
            <p className="todo-panel-subtitle">오늘의 할 일을 관리해보세요.</p>
          </div>
        </div>
      </div>

      <button className="todo-panel-add-btn" onClick={handleClickAdd}>
        + 일정 등록하기
      </button>

      {/* 진행중 */}
      <section className="todo-section todo-section-inprogress">
        <div className="todo-guest-section-header">
          <span className="todo-guest-section-title">진행중</span>
          <span className="todo-guest-section-count">
            ({inProgressTodos.length})
          </span>
        </div>
        <div className="todo-list todo-list-inprogress">
          {inProgressVisible.map((todo) => (
            <div key={todo.id} className="todo-item">
              <input
                type="checkbox"
                checked={!!todo.completed}
                onChange={() => handleToggleStatus(todo)}
                className="todo-checkbox"
              />
              <div className="todo-item-main">
                <div className="todo-item-top">
                  <span className="todo-title">{todo.title}</span>
                </div>

                {todo.promiseDate && (
                  <div className="todo-meta">
                    <span className="todo-meta-dday-value">
                      {getDDayText(todo.promiseDate)}
                    </span>
                    <span className="todo-meta-date">
                      <img src={CalIcon} alt="" className="todo-meta-icon" />
                      {todo.promiseDate.substring(5, 10).replace("-", "/")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {Array.from({ length: inProgressPlaceholderCount }).map((_, idx) => (
            <div
              key={`in-progress-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          <div className="todo-more-text">
            {inProgressHiddenCount > 0
              ? `+ ${inProgressHiddenCount}개`
              : "\u00A0"}
          </div>
        </div>
      </section>

      {/* 완료 */}
      <section className="todo-section todo-section-done">
        <div className="todo-guest-section-header">
          <span className="todo-guest-section-title">완료</span>
          <span className="todo-guest-section-count">
            ({doneTodos.length})
          </span>
        </div>
        <div className="todo-list todo-list-done">
          {doneVisible.map((todo) => (
            <div key={todo.id} className="todo-item todo-item-done">
              <input
                type="checkbox"
                checked={!!todo.completed}
                onChange={() => handleToggleStatus(todo)}
                className="todo-checkbox"
              />
              <div className="todo-item-main">
                <div className="todo-item-top">
                  <span className="todo-title">{todo.title}</span>
                  <button
                    type="button"
                    className="todo-delete-btn"
                    onClick={() => handleDeleteTodo(todo)}
                  >
                    삭제
                  </button>
                </div>

                {todo.promiseDate && (
                  <div className="todo-meta">
                    <span className="todo-meta-dday-value">
                      {getDDayText(todo.promiseDate)}
                    </span>
                    <span className="todo-meta-date">
                      <img src={CalIcon} alt="" className="todo-meta-icon" />
                      {todo.promiseDate.substring(5, 10).replace("-", "/")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}

          {Array.from({ length: donePlaceholderCount }).map((_, idx) => (
            <div
              key={`done-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          <div className="todo-more-text">
            {doneHiddenCount > 0 ? `+ ${doneHiddenCount}개` : "\u00A0"}
          </div>
        </div>
      </section>
    </aside>
  );
}

export default TodoPanel;
