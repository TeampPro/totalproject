// src/components/MenuBar/MenuBar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/MenuBar.css";

export default function MenuBar() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <div className="menu-bar">
      <button className={isActive("/dashboard") ? "active" : ""} onClick={() => navigate("/main")}>
        홈
      </button>
      <button className={isActive("/chat") ? "active" : ""} onClick={() => navigate("/chat")}>
        채팅
      </button>
    </div>
  );
}
