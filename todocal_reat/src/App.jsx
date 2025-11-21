import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

// 공통 레이아웃
import MenuBar from "./components/MenuBar/MenuBar.jsx";

// 대시보드 위젯
import WeatherBoard from "./pages/Weather/WeatherBoard.jsx";
import KakaoMapBox from "./pages/Map/KakaoMapBox.jsx";
import TimeHome from "./components/TimeCalendar/TimeHome.jsx";
import BoardHome from "./pages/Board/BoardHome.jsx";

// Auth
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import BeLogin from "./pages/Auth/BeLogin.jsx";

// 메인/마이페이지
import MainPage from "./pages/Main/MainPage.jsx";
import MyPage from "./pages/My/MyPage.jsx";
import Upload from "./pages/My/Upload.jsx";

// Todo
import TodoPage from "./pages/Todo/TodoPage.jsx";
import Calendar from "./pages/Todo/Calendar.jsx";
import AllTasks from "./pages/Todo/AllTasks.jsx";

// 채팅
import ChatPage from "./pages/Chat/ChatPage.jsx";
import InvitePage from "./pages/Chat/InvitePage.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

// 게시판
import PostDetail from "./pages/Board/PostDetail.jsx";
import PostWrite from "./pages/Board/PostWrite.jsx";

// 검색
import WebSearch from "./components/Search/WebSearch.jsx";

// ❗❗ 누락되어 있던 import 추가
import UserInfo from "./components/myprofile/UserInfo.jsx";

// 로고

// 관리자 페이지 import 추가
import AdminUserManage from "./components/AdminPage/AdminUserManage.jsx";
import AdminUserInfo from "./components/AdminPage/AdminUserInfo.jsx";
import AdminUserTasks from "./components/AdminPage/AdminUserTasks.jsx";
import AdminTaskDetail from "./components/AdminPage/AdminTaskDetail.jsx";

import "./App.css";

function App() {
  const { pathname } = useLocation();

  const showDashboard = pathname === "/main";
  const isLoginOrSignUpPage = pathname === "/" || pathname === "/signup";
  const isMyPage = pathname === "/myPage";

  const [tasks, setTasks] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTodosChange = () => setRefreshKey((prev) => prev + 1);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then((res) => res.json())
      .then((data) => setTasks(data));
  }, [refreshKey]);

  return (
    <>
      <div className="main-layout">
        {showDashboard && (
          <div className="dashboard-new">
            <div className="main-grid">
              <div className="left-area">
                <div className="search-area">
                  <WebSearch />
                </div>
                <div className="calendar-area">
                  <TimeHome onTodosChange={handleTodosChange} />
                </div>
                <div className="board-area">
                  <BoardHome />
                </div>
              </div>

              <div className="right-area">
                <UserInfo onLogout={handleLogout} />
                <WeatherBoard />
                <div className="map-area">
                  <KakaoMapBox />
                </div>
              </div>
            </div>
          </div>
        )}

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

            {/* 관리자 */}
            <Route path="/admin/users" element={<AdminUserManage />} />
            <Route
              path="/admin/users/:userId/info"
              element={<AdminUserInfo />}
            />
            <Route
              path="/admin/users/:userId/tasks"
              element={<AdminUserTasks />}
            />
            <Route path="/admin/tasks/:taskId" element={<AdminTaskDetail />} />

            {/* Todo */}
            <Route
              path="/todo"
              element={<TodoPage tasks={tasks} setTasks={setTasks} />}
            />
          </Routes>
        </div>
      </div>

      {!isLoginOrSignUpPage && !isMyPage && <MenuBar />}
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
