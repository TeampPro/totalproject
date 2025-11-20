import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";

// 공통 레이아웃 컴포넌트
import MenuBar from "./components/MenuBar/MenuBar.jsx";
import TodoHeader from "./components/Header/TodoHeader.jsx";

// 대시보드 위젯들
import WeatherBoard from "./pages/Weather/WeatherBoard.jsx";
import KakaoMapBox from "./pages/Map/KakaoMapBox.jsx";
import TimeHome from "./components/TimeCalendar/TimeHome.jsx";
import BoardHome from "./pages/Board/BoardHome.jsx";

// Auth 관련 페이지
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import BeLogin from "./pages/Auth/BeLogin.jsx";

// 메인 / 마이페이지
import MainPage from "./pages/Main/MainPage.jsx";
import MyPage from "./pages/My/MyPage.jsx";
import Upload from "./pages/My/Upload.jsx";

// Todo 관련 페이지
import TodoPage from "./pages/Todo/TodoPage.jsx";
import Calendar from "./pages/Todo/Calendar.jsx";
import AllTasks from "./pages/Todo/AllTasks.jsx";

// 채팅 관련
import ChatPage from "./pages/Chat/ChatPage.jsx";
import InvitePage from "./pages/Chat/InvitePage.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

import PostDetail from "./pages/Board/PostDetail.jsx"
import PostWrite from "./pages/Board/PostWrite.jsx"

// 검색 컴포넌트
import WebSearch from "./components/Search/WebSearch.jsx";

import "./App.css";


function App() {
  const location = useLocation();

  const isLoginOrSignUpPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname.startsWith("/chat");
  const isMyPage = location.pathname === "/myPage";
  const isTodoPage = location.pathname === "/todo";
  const isBoardDetail = location.pathname.startsWith("/board/");


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
              <div className="search-header">
                <WebSearch />
              </div>
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
