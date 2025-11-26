// src/App.jsx
import { useState, useEffect } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useLocation,
  useNavigate,
} from "react-router-dom";

import MenuBar from "./components/MenuBar/MenuBar.jsx";

// Auth
import Login from "./pages/Auth/Login.jsx";
import SignUp from "./pages/Auth/SignUp.jsx";
import BeLogin from "./pages/Auth/BeLogin.jsx";
import FriendPage from "./pages/Friend/FriendPage.jsx";

// Main / My
import MainPage from "./pages/Main/MainPage.jsx";
import MyPage from "./pages/My/MyPage.jsx";
import Upload from "./pages/My/Upload.jsx";

// Todo
import TodoPage from "./pages/Todo/TodoPage.jsx";
import SharedTodoPage from "./pages/Todo/SharedTodoPage.jsx"; // ✅ 공유일정 페이지 추가

// Board
import PostDetail from "./pages/Board/PostDetail.jsx";
import PostWrite from "./pages/Board/PostWrite.jsx";

// Chat
import ChatPage from "./pages/Chat/ChatPage.jsx";
import InvitePage from "./pages/Chat/InvitePage.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

// Admin
import AdminUserManage from "./components/AdminPage/AdminUserManage.jsx";
import AdminUserInfo from "./components/AdminPage/AdminUserInfo.jsx";
import AdminUserTasks from "./components/AdminPage/AdminUserTasks.jsx";
import AdminTaskDetail from "./components/AdminPage/AdminTaskDetail.jsx";

import "./App.css";

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("user"));
      setUser(saved || null);
    } catch {
      localStorage.removeItem("user");
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/main");
  };

  const noMenu =
    pathname === "/login" || pathname === "/signup" || pathname === "/beLogin";
  const isMyPage = pathname === "/myPage";

  return (
    <>
      <div className="content">
        <Routes>
          <Route path="/" element={<Navigate to="/main" replace />} />

          <Route
            path="/main"
            element={<MainPage user={user} setUser={setUser} />}
          />

          {/* Auth */}
          <Route path="/login" element={<Login setUser={setUser} />} />
          <Route path="/signup" element={<SignUp />} />
          <Route path="/beLogin" element={<BeLogin setUser={setUser} />} />

          {/* My */}
          <Route path="/myPage" element={<MyPage onLogout={handleLogout} />} />
          <Route path="/upload" element={<Upload />} />

          {/* Board */}
          <Route path="/board/:id" element={<PostDetail />} />
          <Route path="/board/write" element={<PostWrite />} />

          {/* Admin */}
          <Route path="/admin/users" element={<AdminUserManage />} />
          <Route path="/admin/users/:userId/info" element={<AdminUserInfo />} />
          <Route
            path="/admin/users/:userId/tasks"
            element={<AdminUserTasks />}
          />
          <Route path="/admin/tasks/:taskId" element={<AdminTaskDetail />} />

          {/* Friends */}
          <Route path="/friends" element={<FriendPage />} />

          {/* Todo */}
          <Route path="/todo" element={<TodoPage />} />
          <Route path="/share" element={<SharedTodoPage />} /> {/* ✅ 공유일정 라우트 */}

          {/* Chat */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
          <Route path="/chat/invite/:code" element={<InvitePage />} />
        </Routes>
      </div>

      {!noMenu && !isMyPage && <MenuBar user={user} />}
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
