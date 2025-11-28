import React from "react";
import "../../styles/TopBar/TopBar.css";

import Logo from "../../assets/logo.svg";
import PlanixLogo from "../../assets/planix3.svg";
import BellIcon from "../../assets/bell.svg";
import ProfileIcon from "../../assets/profile.svg";
import ListIcon from "../../assets/list.svg";

const TopBar = ({ onMenuClick, onProfileClick }) => {
  return (
    <header className="topbar">
      {/* 🔹 메인 레이아웃과 폭을 맞추는 내부 컨테이너 꼭 필요! */}
      <div className="topbar-inner">
        {/* 왼쪽: 로고 + 텍스트 */}
        <div className="topbar-left">
          <img src={Logo} alt="logo" className="topbar-logo" />
          <img src={PlanixLogo} alt="planix" className="topbar-planix" />
        </div>

        {/* 오른쪽: 아이콘 3개 */}
        <div className="topbar-right">
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