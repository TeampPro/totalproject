import { api, apiFetch } from "./api/http.js";
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
import KakaoCallback from "./pages/Auth/KakaoCallback.jsx";

// Main / My
import MainPage from "./pages/Main/MainPage.jsx";
import MyPage from "./pages/My/MyPage.jsx";
import Upload from "./pages/My/Upload.jsx";

// Todo
import TodoPage from "./pages/Todo/TodoPage.jsx";
import SharedTodoPage from "./pages/Todo/SharedTodoPage.jsx";

// Board
import PostDetail from "./pages/Board/PostDetail.jsx";
import PostWrite from "./pages/Board/PostWrite.jsx";
import BoardHome from "./pages/Board/BoardHome.jsx";

// Chat
import ChatPage from "./pages/Chat/ChatPage.jsx";
import InvitePage from "./pages/Chat/InvitePage.jsx";
import ChatRoomWrapper from "./components/Chat/ChatRoomWrapper.jsx";

// Admin
import AdminUserManage from "./components/AdminPage/AdminUserManage.jsx";
import AdminUserInfo from "./components/AdminPage/AdminUserInfo.jsx";
import AdminUserTasks from "./components/AdminPage/AdminUserTasks.jsx";
import AdminTaskDetail from "./components/AdminPage/AdminTaskDetail.jsx";

// hooks
import useInactivityLogout from "./hooks/useInactivityLogout";

import "./App.css";

function App() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);

  useInactivityLogout();

  // 앱 시작 시: localStorage에 user 있으면 서버 세션 확인
  useEffect(() => {
    const savedRaw = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!savedRaw || !token){
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
      return;
    }

    let canceled = false;

    const clearUser = () => {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      setUser(null);
    };

    const validateSession = async () => {
      try {
        const freshUser = await api.get("/api/auth/me");

        if(!canceled) {
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      } catch (err) {
          if(!canceled) {
            console.error("세션 검증 실패:", err);
            clearUser();
          }
        }
    }

      validateSession();

      return () => {
        canceled = true;
      };
  }, []);

  const handleLogout = () => {
    // 서버 세션도 함께 끊기
    apiFetch("/api/logout", {
      method: "POST",
    }).catch(() => {
      // 세션 이미 만료된 경우 등은 무시
    });

    localStorage.removeItem("user");
    localStorage.removeItem("token")
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
          {/* ✅ 카카오 로그인 성공 콜백 라우트 추가 */}
          <Route
            path="/auth/kakao/success"
            element={<KakaoCallback setUser={setUser} />}
          />

          {/* My */}
          <Route path="/myPage" element={<MyPage onLogout={handleLogout} />} />
          <Route path="/upload" element={<Upload />} />

          {/* Board */}
          <Route path="/board" element={<BoardHome />} />
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
          <Route path="/share" element={<SharedTodoPage />} />

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
