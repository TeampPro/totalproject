import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";

import WebSearch from "../../components/Search/WebSearch";
import TimeHome from "../../components/TimeCalendar/TimeHome";
import WeatherBoard from "../../pages/Weather/WeatherBoard";
import KakaoMapBox from "../../pages/Map/KakaoMapBox";

import RightAuthBox from "../../components/RightAuthBox/RightAuthBox.jsx";
import UserInfo from "../../components/myprofile/UserInfo.jsx";

const MainPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
  };

  return (
    <>
      {/* 상단/하단에 띄워지는 것들 */}
      <div className="overlay-wrapper">
        {/* 로그인 X : 로그인 박스 */}
        {!user && (
          <div className="right-auth-fixed">
            <RightAuthBox />
          </div>
        )}

        {/* 로그인 O : 상단 프로필 카드 */}
        {user && (
          <div className="profile-top-wrapper">
            <UserInfo user={user} small />
          </div>
        )}

        {/* 로그인 O : 우측 하단 메뉴 버튼 + 드롭다운 */}
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
                    onClick={() => navigate("/admin/users")}
                  >
                    회원관리
                  </button>
                )}

                <button className="dropdown-item" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 대시보드 */}
      <div className={`dashboard-new ${!user ? "locked" : ""}`}>
        <div className="main-grid">
          {/* left */}
          <div className="left-area">
            <div className="search-area">
              <WebSearch disabled={!user} />
            </div>

            <div className="calendar-area">
              <TimeHome disabled={!user} user={user} />
            </div>

            {/* ✅ 메인에서 게시판 영역 제거 */}
            {/* <div className="board-area">
              <BoardHome disabled={!user} />
            </div> */}
          </div>

          {/* right */}
          <div className="right-area">
            {user && <UserInfo user={user} onLogout={handleLogout} />}
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
