import { useState } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header.jsx";
import MenuBar from "./components/MenuBar/MenuBar.jsx";
import TodoHeader from "./components/Header/TodoHeader.jsx";

import WeatherBoard from "./pages/WeatherBoard";
import Calendar from "./pages/Calendar.jsx";
import AllTasks from "./pages/AllTasks";
import KakaoMapBox from "./pages/KakaoMapBox";

<<<<<<< HEAD
  import Login from "./pages/Login.jsx";
  import SignUp from "./pages/SignUp.jsx";
  import BeLogin from "./pages/BeLogin.jsx";
  import ChatPage from "./pages/ChatPage.jsx";
  import Upload from "./pages/Upload.jsx";
  import MyPage from "./pages/MyPage.jsx";
  import MainPage from "./pages/MainPage.jsx";
  import UserInfo from "../myprofile/UserInfo.jsx";
=======
import Login from "./pages/Login.jsx";
import SignUp from "./pages/SignUp.jsx";
import BeLogin from "./pages/BeLogin.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import Upload from "./pages/Upload.jsx";
import MyPage from "./pages/MyPage.jsx";
import MainPage from "./pages/MainPage.jsx";
import TodoPage from "./components/TodoPage/TodoPage.jsx";
>>>>>>> origin/feature/git

import "./App.css";

function App() {
  const location = useLocation();

<<<<<<< HEAD
    // ✅ 캘린더 → 할일목록 동기화 & 필터 상태
    const [refreshKey, setRefreshKey] = useState(0);
    const [taskFilter, setTaskFilter] = useState("all"); // 'all' | 'week' | 'month'
    const handleTodosChange = () => setRefreshKey((k) => k + 1);
=======
  const isLoginOrSignUpPage =
    location.pathname === "/" || location.pathname === "/signup";
  const isChat = location.pathname === "/chat";
  const isMyPage = location.pathname === "/myPage";
  const isTodoPage = location.pathname === "/todo";

  const [taskFilter, setTaskFilter] = useState("all");
  const [refreshKey, setRefreshKey] = useState(0);
  const handleTodosChange = () => setRefreshKey((prev) => prev + 1);
>>>>>>> origin/feature/git

  const handleFilterChange = (filterType) => {
    setTaskFilter(filterType);
  };

  return (
    <>
      {!isLoginOrSignUpPage && !isMyPage && !isTodoPage && <Header />}

      <div className="main-layout">
        {!isLoginOrSignUpPage && !isChat && !isMyPage && !isTodoPage && (
          <div className="dashboard">
            <div className="weather-widget">
              <WeatherBoard />
            </div>

            <div className="calendar-widget">
              <Calendar onTodosChange={handleTodosChange} />
            </div>

            <div className="bottom-widgets">
              <div className="todo-widget">
                <TodoHeader
                  active={taskFilter}
                  onChangeFilter={handleFilterChange}
                  showAddButton={true} // 메인에서는 + 버튼 표시
                />
                <AllTasks key={refreshKey} filter={taskFilter} />
              </div>
              <div className="map-widget">
                <KakaoMapBox />
              </div>
            </div>
          </div>
        )}

<<<<<<< HEAD
          <div className="content">
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/beLogin" element={<BeLogin />} />
              <Route path="/upload" element={<Upload />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/main" element={<MainPage />} />
              <Route path="/myPage" element={<MyPage />} />
              <Route path="/main" element={<UserInfo />} />
            </Routes>
          </div>
=======
        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/beLogin" element={<BeLogin />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/main" element={<MainPage />} />
            <Route path="/myPage" element={<MyPage />} />
            <Route path="/todo" element={<TodoPage />} /> {/* TodoPage 단독 */}
          </Routes>
>>>>>>> origin/feature/git
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
