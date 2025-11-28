import React from "react";
import "../../styles/TopBar/TopBar.css";

// asset 경로
import Logo from "../../assets/logo.svg";
import PlanixLogo from "../../assets/planix3.svg";
import BellIcon from "../../assets/bell.svg";
import ProfileIcon from "../../assets/profile.svg";
import ListIcon from "../../assets/list.svg";

const TopBar = ({
  onMenuClick,
  onProfileClick,
  notificationCount = 0,   // 7일 이내 일정 개수
  onClickNotification,     // 종 아이콘 클릭 핸들러
}) => {
  const hasNotification = notificationCount > 0;

  const handleBellClick = () => {
    if (onClickNotification) {
      onClickNotification();
    }
  };

  return (
    <div className="topbar">
      {/* 왼쪽: 로고 + 텍스트 */}
      <div className="topbar-left">
        <img src={Logo} alt="logo" className="topbar-logo" />
        <img src={PlanixLogo} alt="planix" className="topbar-planix" />
      </div>

      {/* 오른쪽: 아이콘 3개 (알림 + 프로필 + 메뉴) */}
      <div className="topbar-right">
        {/* 알림 아이콘 + 뱃지 */}
        <div className="topbar-icon-wrapper" onClick={handleBellClick}>
          <img src={BellIcon} alt="알림" className="topbar-icon" />
          {hasNotification && (
            <span className="topbar-badge">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </div>

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
  );
};

export default TopBar;
