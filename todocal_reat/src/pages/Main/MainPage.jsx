import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";

import WebSearch from "../../components/Search/WebSearch";
import TimeHome from "../../components/TimeCalendar/TimeHome";
import WeatherBoard from "../../pages/Weather/WeatherBoard";
import KakaoMapBox from "../../pages/Map/KakaoMapBox";
import BoardHome from "../../pages/Board/BoardHome.jsx"

import RightAuthBox from "../../components/RightAuthBox/RightAuthBox.jsx";
import UserInfo from "../../components/myprofile/UserInfo.jsx";
import TopBar from "../../components/TopBar/TopBar.jsx";
import TodoPanel from "../Todo/TodoPanel.jsx";

const MainPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const calendarRef = useRef(null);
  const [todoReloadKey, setTodoReloadKey] = useState(0);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
  };

  return (
    <div className="page-root">
      {/* ✅ TopBar + 대시보드가 같이 쓰는 공통 레이아웃 박스 */}
      <div className="page-inner">
        {/* 상단바 */}
        <TopBar
          onMenuClick={() => setMenuOpen((prev) => !prev)}
          onProfileClick={() => navigate("/myPage")}
        />

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
                onTodosChange={() => setTodoReloadKey((prev) => prev + 1)}
              />
            </div>

            {/* 3️⃣ 오른쪽 컬럼 (프로필 + Todo + 날씨) */}
            <div className="right-top-area">
              <div className="profile-area">
                {user ? (
                  <UserInfo user={user} onLogout={handleLogout} />
                ) : (
                  <RightAuthBox />
                )}
              </div>

              <div className="todo-area">
                <TodoPanel
                  user={user}
                  reloadKey={todoReloadKey}
                  onAddTodo={() => {
                    calendarRef.current?.openAddTodo();
                  }}
                />
              </div>

              <div className="weather-area">
                <WeatherBoard disabled={!user} />
              </div>
            </div>

            {/* 4️⃣ 아래 행: 지도 */}
            <div className="right-bottom-area">
              <div className="map-area">
                <KakaoMapBox disabled={!user} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainPage;