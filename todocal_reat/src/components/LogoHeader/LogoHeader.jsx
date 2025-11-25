import React from "react";
import logoText from "../../assets/planix1.svg"; // 로고 텍스트
import calendarImg from "../../assets/calendar-3d.svg"; // 왼쪽 3D 캘린더
import alarmImg from "../../assets/alarm-3d.svg"; // 오른쪽 3D 알람

import "../../styles/LogoHeader/LogoHeader.css";

const LogoHeader = () => {
  return (
    <div className="logo-header-container">
      {/* 왼쪽 3D 캘린더 */}
      <img src={calendarImg} className="logo-left-img" alt="calendar" />

      {/* 중앙 텍스트 로고 */}
      <div className="logo-center-box">
        <img src={logoText} className="logo-text" alt="planix logo" />
      </div>

      {/* 오른쪽 3D 알람 */}
      <img src={alarmImg} className="logo-right-img" alt="alarm" />
    </div>
  );
};

export default LogoHeader;
