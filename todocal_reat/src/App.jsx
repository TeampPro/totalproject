// src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import MenuBar from "./components/MenuBar/MenuBar.jsx";
import TodoHeader from "./components/Header/TodoHeader.jsx";

import WeatherBoard from "./pages/WeatherBoard";
import Calendar from "./pages/Calendar.jsx";
import AllTasks from "./pages/AllTasks";
import WeekTasks from "./pages/WeekTasks";
import MonthTasks from "./pages/MonthTasks";
import SharedTasks from "./pages/SharedTasks";
import KakaoMapBox from "./pages/KakaoMapBox";

import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BeLogin from "./pages/BeLogin";
import ChatPage from "./pages/ChatPage";
import Upload from "./pages/Upload.jsx";
import MyPage from "./pages/MyPage.jsx"
import MainPage from "./pages/MainPage.jsx"

import "./App.css";

function App() {
  const location = useLocation();
  const isLoginOrSignUpPage = location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname === "/chat";

  return (
    <>
      {!isLoginOrSignUpPage && <Header />}

      <div className="main-layout">
        {!isLoginOrSignUpPage && !isChat && (
          <div className="dashboard">
            <div className="weather-widget">
              <WeatherBoard />
            </div>

            <div className="calendar-widget">
              <Calendar />
            </div>

            <div className="bottom-widgets">
              <div className="todo-widget">
                <TodoHeader />
                <AllTasks /> {/* 메인 페이지에서 한 번만 렌더링 */}
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
            <Route path="/mainPage" element={<MainPage />} />
            <Route path="/myPage" element={<MyPage />} />
            {/* Routes에서 TaskList 관련 경로 제거 */}
          </Routes>
        </div>
      </div>

      {!isLoginOrSignUpPage && <MenuBar />}
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
