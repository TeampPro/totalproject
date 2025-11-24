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

// 메인/마이페이지
import MainPage from "./pages/Main/MainPage.jsx";
import MyPage from "./pages/My/MyPage.jsx";
import Upload from "./pages/My/Upload.jsx";

// Todo
import TodoPage from "./pages/Todo/TodoPage.jsx";

// 게시판
import PostDetail from "./pages/Board/PostDetail.jsx";
import PostWrite from "./pages/Board/PostWrite.jsx";

// 채팅
import ChatPage from "./pages/Chat/ChatPage.jsx";
import InvitePage from "./pages/Chat/InvitePage.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

// 관리자
import AdminUserManage from "./components/AdminPage/AdminUserManage.jsx";
import AdminUserInfo from "./components/AdminPage/AdminUserInfo.jsx";
import AdminUserTasks from "./components/AdminPage/AdminUserTasks.jsx";
import AdminTaskDetail from "./components/AdminPage/AdminTaskDetail.jsx";

import "./App.css";

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  // 로그인 상태
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

  // 메뉴바 숨길 페이지
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

          {/* 마이페이지 */}
          <Route path="/myPage" element={<MyPage onLogout={handleLogout} />} />
          <Route path="/upload" element={<Upload />} />

          {/* 게시판 */}
          <Route path="/board/:id" element={<PostDetail />} />
          <Route path="/board/write" element={<PostWrite />} />

          {/* 관리자 */}
          <Route path="/admin/users" element={<AdminUserManage />} />
          <Route path="/admin/users/:userId/info" element={<AdminUserInfo />} />
          <Route
            path="/admin/users/:userId/tasks"
            element={<AdminUserTasks />}
          />
          <Route path="/admin/tasks/:taskId" element={<AdminTaskDetail />} />

          {/* Todo */}
          <Route path="/todo" element={<TodoPage />} />

          {/* Chat */}
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/chat/:roomId" element={<ChatRoomWrapper />} />
          <Route path="/chat/invite/:code" element={<InvitePage />} />
        </Routes>
      </div>

      {/* 메뉴바 표시 */}
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
