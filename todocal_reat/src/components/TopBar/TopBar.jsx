import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/TopBar/TopBar.css";

import Logo from "../../assets/logo.svg";
import PlanixLogo from "../../assets/planix3.svg";
import BellIcon from "../../assets/bell.svg";
import ProfileIcon from "../../assets/profile.svg";
import ListIcon from "../../assets/list.svg";
import BackIcon from "../../assets/backIcon.svg"; // 🔹 뒤로가기 아이콘

const TopBar = ({ onMenuClick, onProfileClick, showBackButton = false }) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    // 히스토리가 있으면 뒤로, 없으면 메인으로
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/main");
    }
  };

  return (
    <header className="topbar">
      {/* 🔹 메인 레이아웃과 폭을 맞추는 내부 컨테이너 꼭 필요! */}
      <div className="topbar-inner">
        {/* 왼쪽: 로고 + 텍스트 */}
        <div className="topbar-left">
          <img src={Logo} alt="logo" className="topbar-logo" />
          <img src={PlanixLogo} alt="planix" className="topbar-planix" />
        </div>

        {/* 오른쪽: (옵션) 뒤로가기 + 아이콘 3개 */}
        <div className="topbar-right">
          {showBackButton && (
            <button
              type="button"
              className="topbar-back-btn"
              onClick={handleBackClick}
            >
              <img src={BackIcon} alt="뒤로가기" />
            </button>
          )}

          <img src={BellIcon} alt="알림" className="topbar-icon" />

          <img
            src={ProfileIcon}
            alt="프로필"
            className="topbar-icon"
            onClick={onProfileClick}
          />

          <img
            src={ListIcon}
            alt="메뉴"
            className="topbar-icon"
            onClick={onMenuClick}
          />
        </div>
      </div>
    </header>
  );
};

export default TopBar;