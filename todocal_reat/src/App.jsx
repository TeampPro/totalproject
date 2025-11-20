// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MenuBar from "./components/MenuBar/MenuBar.jsx";

import WeatherBoard from "./pages/WeatherBoard";
import KakaoMapBox from "./pages/KakaoMapBox";
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import BeLogin from "./pages/BeLogin.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Upload from "./pages/Upload.jsx";
import MyPage from "./pages/MyPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import TodoPage from "./components/TodoPage/TodoPage.jsx";
import InvitePage from "./pages/InvitePage.jsx";
import TimeHome from "./components/TimeCalendar/TimeHome.jsx";
import BoardHome from "./components/Board/BoardHome.jsx";
import PostDetail from "./components/Board/PostDetail.jsx";
import PostWrite from "./components/Board/PostWrite.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

import UserInfo from "../myprofile/UserInfo.jsx";

import "./App.css";

function App() {
  const { pathname } = useLocation();

  /* ✔ 대시보드는 /main 에서만 */
  const showDashboard = pathname === "/main";

  // Tasks 관리
  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTodosChange = () => setRefreshKey(prev => prev + 1);

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, [refreshKey]);

  return (
    <>
      <div className="main-layout">

        {/* =============================
            🔥 /main 대시보드 (메인 화면)
        ============================= */}
        {showDashboard && (
          <>
            {/* 대시보드 */}
            <div className="dashboard-new">
              <div className="main-grid">

                {/* 좌측 */}
                <div className="left-area">
                  <div className="calendar-area">
                    <TimeHome onTodosChange={handleTodosChange} />
                  </div>

                  <div className="board-area">
                    <BoardHome />
                  </div>
                </div>

                {/* 우측 */}
                <div className="right-area">
                  <UserInfo />
                  <WeatherBoard />
                  <div className="map-area">
                    <KakaoMapBox />
                  </div>
                </div>

              </div>
            </div>

            {/* 🔥 MainPage 오버레이 → 여기 때문에 버튼이 나타남 */}
            <MainPage />
          </>
        )}

        {/* =============================
            🟦 /main 제외한 페이지 출력
        ============================= */}
        {!showDashboard && (
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/beLogin" element={<BeLogin />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
              <Route path="/chat/invite/:code" element={<InvitePage />} />
              <Route path="/board/:id" element={<PostDetail />} />
              <Route path="/board/write" element={<PostWrite />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/myPage" element={<MyPage />} />
              <Route
                path="/todo"
                element={<TodoPage tasks={tasks} setTasks={setTasks} />}
              />
            </Routes>
          </div>
        )}

      </div>

      {/* 메뉴바 숨김 조건 */}
      {pathname !== "/" &&
        pathname !== "/signup" &&
        pathname !== "/myPage" && <MenuBar />}
    </>
  );
}

export default function Root() {
  return (
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}
