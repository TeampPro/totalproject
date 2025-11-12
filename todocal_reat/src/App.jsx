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
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BeLogin from "./pages/BeLogin";
import ChatPage from "./pages/ChatPage";
import Upload from "./pages/Upload.jsx";
<<<<<<< HEAD
import MyPage from "./pages/MyPage.jsx"
import MainPage from "./pages/MainPage.jsx"

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

        <div className="main-layout">
          {!isLoginOrSignUpPage && !isChat && !isMyPage && location.pathname === "/main" && (
            <div className="dashboard">
              <div className="weather-widget">
                <div className="weather-container">
                  <WeatherBoard />
                </div>
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
        )}

        <div className="content">
          <Routes>
            <Route path="/" element={<Login />} />
<<<<<<< HEAD
=======
            <Route path="/main" element={<MainPage />} />
>>>>>>> origin/feature/login
            <Route path="/signup" element={<SignUp />} />
            <Route path="/beLogin" element={<BeLogin />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/upload" element={<Upload />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/mainPage" element={<MainPage />} />
            <Route path="/myPage" element={<MyPage />} />
            {/* Routes에서 TaskList 관련 경로 제거 */}
          </Routes>
=======
>>>>>>> origin/feature/totalcss
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
