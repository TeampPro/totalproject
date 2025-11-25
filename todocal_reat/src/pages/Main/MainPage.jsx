import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";

import WebSearch from "../../components/Search/WebSearch";
import TimeHome from "../../components/TimeCalendar/TimeHome";
import WeatherBoard from "../../pages/Weather/WeatherBoard";
import BoardHome from "../../pages/Board/BoardHome";
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
      <div className="overlay-wrapper">
        {!user && <RightAuthBox />}

        {user && (
          <div className="profile-top-wrapper">
            <UserInfo user={user} small />
          </div>
        )}
        {user && (
          <div className="menu-wrapper">
            <button
              className="menu-button"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <div className="menu-bar" />
              <div className="menu-bar" />
              <div className="menu-bar" />
            </button>

            {menuOpen && (
              <div className="dropdown">
                <button
                  className="dropdown-item"
                  onClick={() => navigate("/myPage")}
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

            <div className="board-area">
              <BoardHome disabled={!user} />
            </div>
          </div>

          {/* right */}
          <div className="right-area">
            {user && <UserInfo user={user} />}
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
