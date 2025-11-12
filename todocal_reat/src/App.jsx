<<<<<<< HEAD
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

<<<<<<< HEAD
=======
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { useState } from "react";
import Header from "./components/Header/Header.jsx";
import MenuBar from "./components/MenuBar/MenuBar.jsx";
import TodoHeader from "./components/Header/TodoHeader.jsx";

import WeatherBoard from "./pages/WeatherBoard";
import Calendar from "./pages/Calendar.jsx";
import AllTasks from "./pages/AllTasks";
import KakaoMapBox from "./pages/KakaoMapBox";

>>>>>>> origin/feature/todolist
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BeLogin from "./pages/BeLogin";
import ChatPage from "./pages/ChatPage";
import Upload from "./pages/Upload.jsx";
<<<<<<< HEAD
<<<<<<< HEAD
<<<<<<< HEAD
import MyPage from "./pages/MyPage.jsx"
import MainPage from "./pages/MainPage.jsx"
=======
import MyPage from "./pages/MyPage.jsx";
import MainPage from "./pages/MainPage.jsx";

// ✅ 초대 페이지 import 추가
import InviteJoinPage from "./pages/InviteJoinPage.jsx";
>>>>>>> feature/weather

import "./App.css";
=======
import Calendar from "./pages/Calendar.jsx";
import NotFound from "./pages/NotFound.jsx";
import MyPage from "./pages/MyPage.jsx";
import MainPage from "./pages/MainPage.jsx";
>>>>>>> origin/feature/login
=======
  import Login from "./pages/Login.jsx";
  import SignUp from "./pages/SignUp.jsx";
  import BeLogin from "./pages/BeLogin.jsx";
  import ChatPage from "./pages/ChatPage.jsx";
  import Upload from "./pages/Upload.jsx";
  import MyPage from "./pages/MyPage.jsx";
  import MainPage from "./pages/MainPage.jsx";

  import "./App.css";
>>>>>>> origin/feature/totalcss

  function App() {
    const location = useLocation();
    const isLoginOrSignUpPage = location.pathname === "/" || location.pathname === "/signup";
    const isChat = location.pathname === "/chat";
    const isMyPage = location.pathname === "/myPage";

    return (
      <>
        {!isLoginOrSignUpPage && !isMyPage && <Header />}

<<<<<<< HEAD
        <div className="main-layout">
          {!isLoginOrSignUpPage && !isChat && !isMyPage && location.pathname === "/main" && (
            <div className="dashboard">
              <div className="weather-widget">
                <div className="weather-container">
                  <WeatherBoard />
                </div>
=======
            <div className="calendar-widget">
              <Calendar />
=======

import "./App.css";

function App() {
  const location = useLocation();
  const isLoginOrSignUpPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname === "/chat";

  // ✅ 캘린더 → 할일목록 동기화 & 필터 상태
  const [refreshKey, setRefreshKey] = useState(0);
  const [taskFilter, setTaskFilter] = useState("all"); // 'all' | 'week' | 'month'

  const handleTodosChange = () => setRefreshKey((k) => k + 1);

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
              <Calendar onTodosChange={handleTodosChange} />
>>>>>>> origin/feature/todolist
            </div>

            <div className="bottom-widgets">
              <div className="todo-widget">
<<<<<<< HEAD
                <TodoHeader />
                <AllTasks />
>>>>>>> feature/weather
              </div>

              <div className="calendar-widget">
                <Calendar />
              </div>

              <div className="bottom-widgets">
                <div className="todo-widget">
                  <TodoHeader />
                  <AllTasks />
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
              <Route path="/main" element={<MainPage />} />
              <Route path="/myPage" element={<MyPage />} />
            </Routes>
          </div>
<<<<<<< HEAD
=======
                <TodoHeader
                  onChangeFilter={setTaskFilter}
                  active={taskFilter}
                />
                <AllTasks key={refreshKey} filter={taskFilter} />
              </div>
              <div className="map-widget">
                <KakaoMapBox />
              </div>
            </div>
          </div>
>>>>>>> origin/feature/todolist
        )}

        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
<<<<<<< HEAD
<<<<<<< HEAD
=======
            <Route path="/main" element={<MainPage />} />
>>>>>>> origin/feature/login
=======
>>>>>>> origin/feature/todolist
            <Route path="/signup" element={<SignUp />} />
            <Route path="/beLogin" element={<BeLogin />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<ChatPage />} />
<<<<<<< HEAD
            <Route path="/mainPage" element={<MainPage />} />
            <Route path="/myPage" element={<MyPage />} />

            {/* ✅ 여기 새 경로 추가 */}
            <Route path="/chat/invite/:code" element={<InviteJoinPage />} />
=======
>>>>>>> origin/feature/todolist
          </Routes>
=======
>>>>>>> origin/feature/totalcss
        </div>
<<<<<<< HEAD

        {!isLoginOrSignUpPage && !isMyPage && <MenuBar />}
      </>
    );
  }
=======
      </div>

      {!isLoginOrSignUpPage && <MenuBar />}
    </>
  );
}
>>>>>>> origin/feature/todolist

  export default function Root() {
    return (
      <BrowserRouter>
        <App />
      </BrowserRouter>
    );
  }
