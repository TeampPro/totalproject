// src/components/Todo/TodoPanel.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/Todo/TodoPanel.css";
import TodoIcon from "../../assets/TodoIcon.svg";
import CalIcon from "../../assets/calIcon.svg";

function TodoPanel({ user, onAddTodo, reloadKey }) {
  const [todos, setTodos] = useState([]);
  const navigate = useNavigate();

  // 로그인 여부 (props user 또는 localStorage 둘 다 체크)
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isLoggedIn = !!(user?.id || storedUser?.id);

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

  // ✅ Todo 리스트 불러오기 (로그인했을 때만)
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
    if (isLoggedIn) {
      fetchTodos();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, isLoggedIn]);

  // ✅ 진행/완료 토글 (DB에 반영) – 로그인 필요
  //    ★ 여기서 completed만 사용하는 PATCH /complete API를 호출하도록 변경
  const handleToggleStatus = async (todo) => {
    if (!ensureLogin()) return;

    // ★ 변경: 현재 로그인한 userId 계산
    const currentUserId = user?.id || storedUser?.id;
    if (!currentUserId) {
      alert("로그인 정보가 없습니다. 다시 로그인 해주세요.");
      return;
    }

    try {
      const nextCompleted = !todo.completed;

      // ★ 변경: PUT 전체 업데이트 → PATCH 완료 상태만 변경
      const res = await axios.patch(
        `http://localhost:8080/api/tasks/${todo.id}/complete`,
        null, // 바디 없음
        {
          params: {
            userId: currentUserId,
            completed: nextCompleted,
          },
        }
      );

      const updated = res.data; // 서버에서 업데이트된 Task 반환된다고 가정

      // 로컬 상태 즉시 반영
      setTodos((prev) => prev.map((t) => (t.id === todo.id ? updated : t)));
    } catch (err) {
      console.error("✅ 상태 변경 실패:", err);
      alert("상태 변경 중 오류가 발생했습니다.");
    }
  };

  // ✅ 일정 추가 버튼 클릭 – 로그인 필요
  const handleClickAdd = () => {
    if (!ensureLogin()) return;
    if (onAddTodo) onAddTodo();
  };

  // ------------ 목록/카운트 로직 (로그인 상태일 때만 사용) ------------

  const inProgressTodos = todos.filter((t) => !t.completed);
  const doneTodos = todos.filter((t) => t.completed);

  // 진행중: 3칸, 완료: 2칸
  const MAX_IN_PROGRESS_VISIBLE = 3;
  const MAX_DONE_VISIBLE = 2;

  // 진행중
  const inProgressVisible = inProgressTodos.slice(0, MAX_IN_PROGRESS_VISIBLE);
  const inProgressHiddenCount = Math.max(
    0,
    inProgressTodos.length - MAX_IN_PROGRESS_VISIBLE
  );
  const inProgressPlaceholderCount = Math.max(
    0,
    MAX_IN_PROGRESS_VISIBLE - inProgressVisible.length
  );

  // 완료
  const doneVisible = doneTodos.slice(0, MAX_DONE_VISIBLE);
  const doneHiddenCount = Math.max(0, doneTodos.length - MAX_DONE_VISIBLE);
  const donePlaceholderCount = Math.max(
    0,
    MAX_DONE_VISIBLE - doneVisible.length
  );

  // 🔹 비로그인 전용(게스트) 뷰
  if (!isLoggedIn) {
    return (
      <aside className="todo-panel todo-panel-guest">
        {/* 헤더 */}
        <div className="todo-panel-header">
          <div className="todo-panel-title-row">
            <img src={TodoIcon} alt="할일아이콘" className="todo-panel-icon" />
            <span className="todo-panel-title">할 일 목록</span>
          </div>
          <p className="todo-panel-notice">
            로그인 후 일정 등록 및 상태 변경이 가능합니다.
          </p>
        </div>

        {/* 제목 바로 아래 버튼 (로그인 유도용) */}
        <button className="todo-panel-add-btn" onClick={handleClickAdd}>
          + 일정 등록하기
        </button>

        {/* 진행 중 섹션 */}
        <section className="todo-guest-section todo-guest-section-inprogress">
          <div className="todo-guest-section-header">
            <span className="todo-guest-section-title">진행 중</span>
            <span className="todo-guest-section-count">(1)</span>
          </div>

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

        {/* 완료 섹션 */}
        <section className="todo-guest-section todo-guest-section-done">
          <div className="todo-guest-section-header">
            <span className="todo-guest-section-title">완료</span>
            <span className="todo-guest-section-count">(1)</span>
          </div>

          <div className="todo-guest-card">
            <div className="todo-guest-row todo-guest-row-done">
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
      </aside>
    );
  }

  // ============================================
  // 🔹 여기부터는 “로그인 상태” UI
  // ============================================
  return (
    <aside className="todo-panel">
      {/* 헤더 */}
      <div className="todo-panel-header">
        <div className="todo-panel-title-row">
          <img src={TodoIcon} alt="할일아이콘" className="todo-panel-icon" />
          <span className="todo-panel-title">할 일 목록</span>
        </div>

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
      <section className="todo-section todo-section-inprogress">
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

          {/* 3칸 유지용 placeholder */}
          {Array.from({ length: inProgressPlaceholderCount }).map((_, idx) => (
            <div
              key={`in-progress-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          <div className="todo-more-text">
            {inProgressHiddenCount > 0
              ? `+ ${inProgressHiddenCount}개 더 있음`
              : "\u00A0"}
          </div>
        </div>
      </section>

      {/* 완료 섹션 */}
      <section className="todo-section todo-section-done">
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

          {/* 2칸 유지용 placeholder */}
          {Array.from({ length: donePlaceholderCount }).map((_, idx) => (
            <div
              key={`done-placeholder-${idx}`}
              className="todo-item todo-item-placeholder"
            />
          ))}

          <div className="todo-more-text">
            {doneHiddenCount > 0 ? `+ ${doneHiddenCount}개 더 있음` : "\u00A0"}
          </div>
        </div>
      </section>
    </aside>
  );
}

export default TodoPanel;
