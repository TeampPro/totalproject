import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/MenuBar/MenuBar.css";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="floating-bar">
      <div
        className={`menu-btn ${isActive("/main") ? "active" : ""}`}
        onClick={() => navigate("/main")}
      >
        <img src="/icons/home.png" alt="home" />
        <span>홈</span>
      </div>

      <div
        className={`menu-btn ${isActive("/chat") ? "active" : ""}`}
        onClick={() => navigate("/chat")}
      >
        <img src="/icons/chat.png" alt="chat" />
        <span>채팅</span>
      </div>
    </div>
  );
}
