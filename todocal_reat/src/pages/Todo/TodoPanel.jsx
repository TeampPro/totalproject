// src/components/Todo/TodoPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; // ✅ 추가
import axios from "axios";
import "../../styles/Todo/TodoPanel.css";
import TodoIcon from "../../assets/TodoIcon.svg";
import CalIcon from "../../assets/calIcon.svg";

function TodoPanel({ user, onAddTodo, reloadKey }) {
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate(); // ✅ 추가

  // 로그인 여부 (props user 또는 localStorage 둘 다 체크)
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!(user?.id || storedUser?.id); // ✅ 추가

  const getDDayText = (promiseDate) => {
    if (!promiseDate) return "";

    const target = new Date(promiseDate);
    const today = new Date();

    target.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);

    const diffMs = target - today;
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return "D-Day";
    if (diffDays > 0) return `D-${diffDays}`;
    return `D+${Math.abs(diffDays)}`;
  };

  // ✅ 로그인 확인 헬퍼
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

  // ✅ Todo 리스트 불러오기
  const fetchTodos = async () => {
    try {
      const params = {};
      if (storedUser?.id) params.userId = storedUser.id;

      const res = await axios.get("http://localhost:8080/api/tasks", {
        params,
      });

      setTodos(res.data || []);
    } catch (err) {
      console.error("❌ Todo 패널 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, isLoggedIn]);

  // ✅ 진행/완료 토글 (DB에 반영) – 로그인 필요
  const handleToggleStatus = async (todo) => {
    if (!ensureLogin()) return; // 🔒 비로그인 차단

    try {
      const updated = {
        ...todo,
        completed: !todo.completed,
      };

      await axios.put(`http://localhost:8080/api/tasks/${todo.id}`, updated);

      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
      fetchTodos();
    } catch (err) {
      console.error("✅ 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 일정 추가 버튼 클릭 – 로그인 필요
  const handleClickAdd = () => {
    if (!ensureLogin()) return; // 🔒 비로그인 차단
    if (onAddTodo) onAddTodo();
  };

    const inProgressTodos = todos.filter((t) => !t.completed);
    const doneTodos = todos.filter((t) => t.completed);

    // ✅ 최대 출력 개수
    const MAX_VISIBLE = 5;

    // 진행중 목록
    const inProgressVisible = inProgressTodos.slice(0, MAX_VISIBLE);
    const inProgressHiddenCount =
      inProgressTodos.length - inProgressVisible.length;
    const inProgressPlaceholderCount = Math.max(
      0,
      MAX_VISIBLE - inProgressVisible.length
    );

    // 완료 목록
    const doneVisible = doneTodos.slice(0, MAX_VISIBLE);
    const doneHiddenCount = doneTodos.length - doneVisible.length;
    const donePlaceholderCount = Math.max(0, MAX_VISIBLE - doneVisible.length);

  return (
    <aside className="todo-panel">
      {/* 헤더 */}
      <div className="todo-panel-header">
        <div className="todo-panel-title-row">
          <img src={TodoIcon} alt="할일아이콘" className="toto-panel-icon" />
          <span className="todo-panel-title">할 일 목록</span>
        </div>

        {/* 🔔 비로그인 안내 문구 */}
        {!isLoggedIn && (
          <p className="todo-panel-notice">
            로그인 후 일정 등록 및 상태 변경이 가능합니다.
          </p>
        )}
      </div>

      {/* 제목 바로 아래 버튼 */}
      <button className="todo-panel-add-btn" onClick={handleClickAdd}>
        + 일정 등록하기
      </button>

      {/* 진행중 섹션 */}
      <section className="todo-section">
        <div className="todo-section-header">
          <span className="todo-section-title">
            진행중 ({inProgressTodos.length})
          </span>
        </div>

        <div className="todo-list">
          {inProgressVisible.map((todo) => (
            <label key={todo.id} className="todo-item">
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
            </label>
          ))}

          {/* ✅ 빈 줄(placeholder)로 높이 채우기 */}
          {Array.from({ length: inProgressPlaceholderCount }).map((_, idx) => (
            <div
              key={`in-progress-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          {/* ✅ 5개 초과일 때 +N개 표시 */}
          {inProgressHiddenCount > 0 && (
            <div className="todo-more-text">
              + {inProgressHiddenCount}개
            </div>
          )}
        </div>
      </section>

      {/* 완료 섹션 */}
      <section className="todo-section">
        <div className="todo-section-header">
          <span className="todo-section-title">완료 ({doneTodos.length})</span>
        </div>

        <div className="todo-list">
          {doneVisible.map((todo) => (
            <label key={todo.id} className="todo-item todo-item-done">
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
            </label>
          ))}

          {/* ✅ 빈 줄(placeholder)로 높이 채우기 */}
          {Array.from({ length: donePlaceholderCount }).map((_, idx) => (
            <div
              key={`done-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          {/* ✅ 5개 초과일 때 +N개 표시 */}
          {doneHiddenCount > 0 && (
            <div className="todo-more-text">+ {doneHiddenCount}개</div>
          )}
        </div>
      </section>
    </aside>
  );
}

export default TodoPanel;
