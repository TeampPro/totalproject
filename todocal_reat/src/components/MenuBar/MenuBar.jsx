// src/components/MenuBar/MenuBar.jsx
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/MenuBar/MenuBar.css";
import mytodo from "../../assets/mytodo.svg";
import homeLogo from "../../assets/homeLogo.svg";
import chatLogo from "../../assets/chat.svg";
import communityLogo from "../../assets/community.svg";
import shareLogo from "../../assets/share.svg";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem("user"));

  const requireLogin = () => {
    if (!user) {
      alert("로그인이 필요합니다.");
      return false;
    }
    return true;
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className="floating-bar">
      {/* 나의 일정 */}
      <div
        className={`menu-btn ${isActive("/todo") ? "active" : ""}`}
        onClick={() => {
          if (!requireLogin()) return;
          navigate("/todo");
        }}
      >
        <img src={mytodo} />
        <span>나의 일정</span>
      </div>

      {/* 공유 일정 */}
      <div
        className={`menu-btn ${isActive("/share") ? "active" : ""}`}
        onClick={() => {
          if (!requireLogin()) return;
          navigate("/share");
        }}
      >
        <img src={shareLogo} />
        <span>공유일정</span>
      </div>

      {/* 홈 — 로그인 필요 없음 */}
      <div
        className={`menu-btn home-active ${isActive("/main") ? "active" : ""}`}
        onClick={() => navigate("/main")}
      >
        <img src={homeLogo} />
        <span>홈</span>
      </div>

      {/* 커뮤니티 → 게시판(/board)으로 이동 */}
      <div
        className={`menu-btn ${isActive("/board") ? "active" : ""}`}
        onClick={() => {
          if (!requireLogin()) return;
          navigate("/board");
        }}
      >
        <img src={communityLogo} />
        <span>커뮤니티</span>
      </div>

      {/* 채팅 */}
      <div
        className={`menu-btn ${isActive("/chat") ? "active" : ""}`}
        onClick={() => {
          if (!requireLogin()) return;
          navigate("/chat");
        }}
      >
        <img src={chatLogo} />
        <span>채팅</span>
      </div>
    </div>
  );
}
