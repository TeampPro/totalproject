import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";
import axios from "axios";

import WebSearch from "../../components/Search/WebSearch";
import TimeHome from "../../components/TimeCalendar/TimeHome";
import WeatherBoard from "../../pages/Weather/WeatherBoard";
import KakaoMapBox from "../../pages/Map/KakaoMapBox";
import BoardHome from "../../pages/Board/BoardHome.jsx";

import RightAuthBox from "../../components/RightAuthBox/RightAuthBox.jsx";
import UserInfo from "../../components/myprofile/UserInfo.jsx";
import TopBar from "../../components/TopBar/TopBar.jsx";
import TodoPanel from "../Todo/TodoPanel.jsx";

const MainPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const calendarRef = useRef(null);

  const [todoReloadKey, setTodoReloadKey] = useState(0);

  // 7일 이내 마감 일정 리스트
  const [urgentTodos, setUrgentTodos] = useState([]);
  // 종 버튼 눌렀을 때 알림창 ON/OFF
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
  };

  // 알림 한 줄 클릭 시: 알림창 닫고 일정 페이지로 이동
  const handleClickAlertItem = (todo) => {
    setShowAlertDropdown(false);

    // 공유 일정이면 공유 일정 페이지로, 아니면 내 일정(todo) 페이지로
    if (todo.shared) {
      navigate("/share");
    } else {
      navigate("/todo");
    }
  };

  // 7일 이내 마감 일정 조회 (메인 상단 알림용)
  useEffect(() => {
    const fetchUrgentTodos = async () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "null");
        if (!storedUser?.id) {
          setUrgentTodos([]);
          return;
        }

        const res = await axios.get("http://localhost:8080/api/tasks", {
          params: { userId: storedUser.id },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const urgent = (res.data || [])
          .filter((t) => t.promiseDate) // 날짜 있는 것만
          .map((t) => {
            const target = new Date(t.promiseDate);
            target.setHours(0, 0, 0, 0);
            const diffDays = Math.round(
              (target.getTime() - today.getTime()) /
                (1000 * 60 * 60 * 24)
            );
            return { ...t, diffDays };
          })
          // 오늘 ~ 7일 이내 + 미완료
          .filter((t) => t.diffDays >= 0 && t.diffDays <= 7 && !t.completed)
          // 남은 날짜 적은 순 정렬
          .sort((a, b) => a.diffDays - b.diffDays);

        setUrgentTodos(urgent);
      } catch (error) {
        console.error("메인 알림용 일정 조회 실패:", error);
      }
    };

    fetchUrgentTodos();
  }, [user, todoReloadKey]);

  return (
    <>
      {/* 상단바 */}
      <TopBar
        onMenuClick={() => setMenuOpen((prev) => !prev)}
        onProfileClick={() => navigate("/myPage")}
        notificationCount={urgentTodos.length}
        onClickNotification={() => {
          if (!user) {
            alert("로그인 후 일정 알림을 확인할 수 있습니다.");
            return;
          }
          setShowAlertDropdown((prev) => !prev);
        }}
      />

      {/* 일정 알림 드롭다운 */}
      {showAlertDropdown && (
        <div className="alert-dropdown">
          <div className="alert-dropdown-header">7일 이내 마감 일정</div>

          {urgentTodos.length === 0 ? (
            <div className="alert-dropdown-empty">
              곧 마감되는 일정이 없습니다.
            </div>
          ) : (
            <ul className="alert-dropdown-list">
              {urgentTodos.map((todo) => (
                <li
                  key={todo.id}
                  className="alert-dropdown-item"
                  onClick={() => handleClickAlertItem(todo)}
                >
                  <span className="alert-dday">
                    {todo.diffDays === 0 ? "D-Day" : `D-${todo.diffDays}`}
                  </span>
                  <span className="alert-title">{todo.title}</span>
                  <span className="alert-date">
                    {todo.promiseDate
                      ? todo.promiseDate.substring(5, 10).replace("-", "/")
                      : ""}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* 우측 하단 메뉴 버튼 */}
      {user && (
        <div className="menu-wrapper">
          <button
            className="menu-button"
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div className="menu-bar" />
            <div className="menu-bar" />
            <div className="menu-bar" />
          </button>

          {menuOpen && (
            <div className="dropdown">
              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/myPage");
                }}
              >
                마이페이지
              </button>

              {user?.userType === "ADMIN" && (
                <button
                  className="dropdown-item"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate("/admin/users");
                  }}
                >
                  회원관리
                </button>
              )}

              <button
                className="dropdown-item"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
              >
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}

      {/* 메인 대시보드 */}
      <div className={`dashboard-new ${!user ? "locked" : ""}`}>
        <div className="main-grid">
          {/* 1️⃣ 검색창 전체 폭 */}
          <div className="search-wide">
            <WebSearch disabled={!user} />
          </div>

          {/* 2️⃣ 캘린더 (왼쪽) */}
          <div className="calendar-area">
            <TimeHome
              disabled={!user}
              user={user}
              calendarRef={calendarRef}
              // ✅ Calendar에서 할 일 변경되면 여기로 신호 옴
              onTodosChange={() => setTodoReloadKey((prev) => prev + 1)}
            />
          </div>

          {/* 3️⃣ 프로필 (오른쪽) */}
          <div className="right-top-area">
            <div className="profile-area">
              {user ? (
                <UserInfo user={user} onLogout={handleLogout} />
              ) : (
                <RightAuthBox />
              )}
            </div>

            {/* ✅ 여기 Todo 패널이 “캘린더 오른쪽 / 마이페이지 아래” 위치 */}
            <div className="todo-area">
              <TodoPanel
                user={user} // 로그인 여부는 내부에서 판단
                reloadKey={todoReloadKey}
                onAddTodo={() => {
                  // 👇 Calendar.jsx에서 useImperativeHandle로 노출한 함수
                  calendarRef.current?.openAddTodo();
                }}
              />
            </div>
          </div>

          {/* 4️⃣ 게시판 (왼쪽 아래) */}
          {/* <div className="board-area">
            <BoardHome disabled={!user} />
          </div> */}

          {/* 5️⃣ 오른쪽 아래 (날씨 + 지도) */}
          <div className="right-bottom-area">
            <WeatherBoard disabled={!user} />
            <div className="map-area">
              <KakaoMapBox disabled={!user} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default MainPage;
