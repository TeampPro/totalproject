// frontend/src/App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import Header from "./components/Header/Header";
import WeatherBoard from "./pages/WeatherBoard";
import AllTasks from "./pages/AllTasks";
import WeekTasks from "./pages/WeekTasks";
import MonthTasks from "./pages/MonthTasks";
import SharedTasks from "./pages/SharedTasks";
import AddTaskPage from "./pages/AddTaskPage";
import KakaoMapBox from "./pages/KakaoMapBox";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BeLogin from "./pages/BeLogin";
import ChatPage from "./pages/ChatPage";
import Upload from "./pages/Upload.jsx";
import Calendar from "./pages/Calendar.jsx";
import NotFound from "./pages/NotFound.jsx";

function App() {
  const location = useLocation();
  const isChat = location.pathname === "/chat";

  return (
    <>
      <Header />
      {/* ✅ /chat 에서는 WeatherBoard 숨김 */}
      {!isChat && <WeatherBoard />}
      <ChatPage />
      <Calendar />

      <div className="main-layout">
        <div className="content" style={{ minHeight: "70vh" }}>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />   
            <Route path="/beLogin" element={<BeLogin />} />
            <Route path="/upload" element={<Upload />} />
            {/* <Route path="/calendar" element={<Calendar />} /> */}
            <Route path="*" element={<NotFound />} />
            <Route path="/tasks" element={<AllTasks />} />
            <Route path="/week" element={<WeekTasks />} />
            <Route path="/month" element={<MonthTasks />} />
            <Route path="/shared" element={<SharedTasks />} />
            <Route path="/add" element={<AddTaskPage />} />
            {/* <Route path="/chat" element={<ChatPage />} /> */}
          </Routes>
        </div>

        {!isChat && <KakaoMapBox />}
      </div>
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
