import { useState } from "react";
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
import InvitePage from "./pages/InvitePage.jsx"
import BoardHome from "./components/Board/BoardHome.jsx";
import PostDetail from "./components/Board/PostDetail.jsx";
import PostWrite from "./components/Board/PostWrite.jsx";

import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx"

import "./App.css";
import TimeHome from "./components/TimeCalendar/TimeHome.jsx";

function App() {
  const location = useLocation();

  const isLoginOrSignUpPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname.startsWith("/chat");
  const isMyPage = location.pathname === "/myPage";
  const isTodoPage = location.pathname === "/todo";
  const isBoardDetail = location.pathname.startsWith("/board/");


  const [taskFilter, setTaskFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const handleTodosChange = () => setRefreshKey((prev) => prev + 1); 
  
  const handleFilterChange = (filterType) => {
    setTaskFilter(filterType);
  };

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
            <Route path="/todo" element={<TodoPage />} /> {/* TodoPage 단독 */}
            <Route path="/chat/invite/:code" element={<InvitePage />} />
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
