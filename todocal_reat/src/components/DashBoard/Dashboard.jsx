import React from "react";
import WeatherBoard from "../../pages/WeatherBoard";
import Calendar from "../../pages/Calendar";
import AllTasks from "../../pages/AllTasks";
import KakaoMapBox from "../../pages/KakaoMapBox";
import "../../styles/Dashboard.css";

export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* 상단: 날씨 정보 */}
      <div className="weather-widget">
        <WeatherBoard />
      </div>

      {/* 중간: 캘린더 */}
      <div className="calendar-widget">
        <Calendar />
      </div>

      {/* 하단: Todo + Kakao Map */}
      <div className="bottom-widgets">
        <div className="todo-widget">
          <AllTasks />
        </div>
        <div className="map-widget">
          <KakaoMapBox />
        </div>
      </div>
    </div>
  );
}
