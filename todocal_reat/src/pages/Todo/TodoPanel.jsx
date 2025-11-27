// src/components/Todo/TodoPanel.jsx
import { useState, useEffect } from "react";
import axios from "axios";
import "../../styles/Todo/TodoPanel.css";
import TodoIcon from "../../assets/TodoIcon.svg";
import CalIcon from "../../assets/calIcon.svg";

function TodoPanel({ user, onAddTodo, reloadKey }) {
  const [todos, setTodos] = useState([]);

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

  // ✅ Todo 리스트 불러오기 (Calendar에서 쓰는 /api/tasks 와 동일하게 사용)
  const fetchTodos = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      const params = {};
      if (storedUser?.id) params.userId = storedUser.id;

      const res = await axios.get("http://localhost:8080/api/tasks", {
        params,
      });

      // 👉 여기는 백엔드 필드명에 맞춰서 맞게 써줘야 함
      // 예시: { id, title, promiseDate, completed } 라고 가정
      setTodos(res.data || []);
    } catch (err) {
      console.error("❌ Todo 패널 불러오기 실패:", err);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [reloadKey]);

  // ✅ 진행/완료 토글 (DB에 반영)
  const handleToggleStatus = async (todo) => {
    try {
      const updated = {
        ...todo,
        // completed(또는 status) 필드명은 백엔드에 맞게 변경
        completed: !todo.completed,
      };

      await axios.put(`http://localhost:8080/api/tasks/${todo.id}`, updated);

      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (err) {
      console.error("✅ 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 필터링 (completed true/false 기준)
  const inProgressTodos = todos.filter((t) => !t.completed);
  const doneTodos = todos.filter((t) => t.completed);

  return (
    <aside className="todo-panel">
      {/* 헤더: 제목만 */}
      <div className="todo-panel-header">
        <div className="todo-panel-title-row">
          <img src={TodoIcon} alt="할일아이콘" className="toto-panel-icon" />
          <span className="todo-panel-title">할 일 목록</span>
        </div>
      </div>

      {/* 제목 바로 아래 버튼 */}
      <button className="todo-panel-add-btn" onClick={onAddTodo}>
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
          {inProgressTodos.map((todo) => (
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
                  {/* 🔻 중요도 태그는 제거했으므로 아무 것도 안 씀 */}
                </div>

                {/* 마감일이 있으면 표시 (필드명은 promiseDate 가정) */}
                {todo.promiseDate && (
                  <div className="todo-meta">
                    {/* 왼쪽: D-day */}
                    <span className="todo-meta-dday-value">
                      {getDDayText(todo.promiseDate)}
                    </span>

                    {/* 오른쪽: 캘린더 아이콘 + 날짜 */}
                    <span className="todo-meta-date">
                      <img src={CalIcon} alt="" className="todo-meta-icon" />
                      {todo.promiseDate.substring(5, 10).replace("-", "/")}
                    </span>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>

      {/* 완료 섹션 */}
      <section className="todo-section">
        <div className="todo-section-header">
          <span className="todo-section-title">완료 ({doneTodos.length})</span>
        </div>

        <div className="todo-list">
          {doneTodos.map((todo) => (
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
                  {/* 중요도 태그 없음 */}
                </div>

                {todo.promiseDate && (
                  <div className="todo-meta">
                    {/* 왼쪽: D-day */}
                    <span className="todo-meta-dday-value">
                      {getDDayText(todo.promiseDate)}
                    </span>

                    {/* 오른쪽: 캘린더 아이콘 + 날짜 */}
                    <span className="todo-meta-date">
                      <img src={CalIcon} alt="" className="todo-meta-icon" />
                      {todo.promiseDate.substring(5, 10).replace("-", "/")}
                    </span>
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </section>
    </aside>
  );
}

export default TodoPanel;
