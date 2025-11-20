// src/App.jsx
import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import MenuBar from "./components/MenuBar/MenuBar.jsx";
import TodoHeader from "./components/Header/TodoHeader.jsx";

import WeatherBoard from "./pages/WeatherBoard";
import Calendar from "./pages/Calendar.jsx";
import AllTasks from "./pages/AllTasks";
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
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx"

import "./App.css";
import AdminUserManage from "./components/AdminPage/AdminUserManage.jsx";
import AdminUserInfo from "./components/AdminPage/AdminUserInfo.jsx";
import AdminUserTasks from "./components/AdminPage/AdminUserTasks.jsx";
import AdminTaskDetail from "./components/AdminPage/AdminTaskDetail.jsx";

function App() {
  const location = useLocation();

  const isLoginOrSignUpPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname.startsWith("/chat");
  const isMyPage = location.pathname === "/myPage";
  const isTodoPage = location.pathname === "/todo";
  const isBoardDetail = location.pathname.startsWith("/board/");
  const isAdmin = location.pathname.startsWith("/admin");


  // ✅ 전체 tasks 상태 관리
  const [tasks, setTasks] = useState([]);
  const [taskFilter, setTaskFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);

  const handleTodosChange = () => setRefreshKey((prev) => prev + 1);

  const handleFilterChange = (filterType) => {
    setTaskFilter(filterType);
  };

  // ✅ 초기 tasks 로드
  useEffect(() => {
    fetch("http://localhost:8080/api/tasks")
      .then(res => res.json())
      .then(data => setTasks(data));
  }, [refreshKey]);

  return (
    <>
      <div className="main-layout">
        {!isLoginOrSignUpPage &&
          !isChat &&
          !isMyPage &&
          !isTodoPage &&
          !isBoardDetail && (
            <div className="dashboard">
              <div className="weather-widget">
                <WeatherBoard />
              </div>

              <div className="calendar-widget">
                <TimeHome onTodosChange={handleTodosChange} />
              </div>

              <div className="bottom-widgets">
                <div className="todo-widget">
                  <BoardHome /> {/* ← 게시판으로 변경 */}
                </div>
                <div className="map-widget">
                  <KakaoMapBox />
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
            {/* 관리자 회원 관리 메인 */}
            <Route path="/admin/users" element={<AdminUserManage />} />
            {/* as11 아이디의 정보 페이지 */}
            <Route path="/admin/users/:userId/info" element={<AdminUserInfo />} />
            {/* as11 아이디의 일정(활동) 페이지 */}
            <Route path="/admin/users/:userId/tasks" element={<AdminUserTasks />} />
            <Route path="/admin/tasks/:taskId" element={<AdminTaskDetail />} />
            <Route path="/todo" element={<TodoPage tasks={tasks} setTasks={setTasks} />} />
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
