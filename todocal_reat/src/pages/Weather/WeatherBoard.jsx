// src/pages/Weather/WeatherBoard.jsx
import { useEffect, useState } from "react";
import "../../styles/Weather/WeatherBoard.css";
import { api } from "../../api/http";

export default function WeatherBoard() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const json = await api.get("/api/weather/multi");

      if (json?.status === "warming-up") {
        setMessage("날씨 데이터를 준비 중입니다. 잠시 후 다시 시도해 주세요.");
        setData([]);
      } else if (Array.isArray(json) && json.length > 0) {
        setData(json);
        setCurrentIndex(0);
        setMessage("");
      } else {
        setMessage("날씨 정보를 불러오지 못했습니다.");
      }
    } catch (err) {
      console.error("날씨 불러오기 실패:", err);
      setMessage("날씨 정보를 가져오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <div className="loading">날씨 불러오는 중...</div>;
  if (message) return <div className="loading">{message}</div>;
  if (data.length === 0)
    return <div className="loading">날씨 데이터를 찾을 수 없습니다.</div>;

  const w = data[currentIndex];

  // 키를 앞뒤 공백까지 허용해 찾기
  const getValue = (obj, key) => {
    if (!obj) return undefined;
    return obj[key] ?? obj[` ${key}`] ?? obj[String(key)?.trim()];
  };

  function formatDate(dateStr) {
    if (!dateStr) return "날짜 정보 없음";
    const clean = String(dateStr);
    const year = clean.slice(0, 4);
    const month = clean.slice(4, 6);
    const day = clean.slice(6, 8);
    return `${year}/${month}/${day}`;
  }

  function formatTime(timeVal) {
    if (timeVal === undefined || timeVal === null) return "??:??";
    const clean = String(timeVal).replace(/\D/g, "").padStart(4, "0").slice(0, 4);
    return `${clean.slice(0, 2)}:${clean.slice(2, 4)}`;
  }

  function getWeatherIcon(pty, sky) {
    if (pty && pty !== "없음") {
      switch (pty) {
        case "비":
          return "🌧️";
        case "비/눈":
          return "🌨️";
        case "눈":
          return "❄️";
        case "빗방울":
          return "💧";
        case "빗방울/눈날림":
          return "🌦️";
        case "눈날림":
          return "🌨️";
        default:
          return "🌧️";
      }
    }

    switch (sky) {
      case "맑음":
        return "☀️";
      case "구름많음":
        return "⛅";
      case "흐림":
        return "☁️";
      default:
        return "🌤️";
    }
  }

  return (
    <div className="page-container">
      <div className="weather-container">
        <div className="card-wrapper">
          {w && (
            <div key={currentIndex} className="weather-card fade-in-out">
              <div className="weather-card-inner">
                <div className="card-top">
                  <div className="card-main">
                    <div className="city">
                      {getValue(w, "도시") ?? "도시 정보 없음"}
                    </div>
                    <div className="time">
                      {formatDate(getValue(w, "기준일자"))}{" "}
                      {formatTime(
                        getValue(w, "기준시각") || getValue(w, "기준시간") // 수정: 백엔드 키 맞춤
                      )}{" "}
                      기준
                    </div>
                    <div className="temp-chip">
                      <span className="temp-number">{getValue(w, "기온") ?? "-"}</span>
                      <span className="temp-unit"></span>
                    </div>
                  </div>
                  <div className="icon">
                    {getWeatherIcon(
                      getValue(w, "강수형태") || getValue(w, "강수상태"), // 수정: 백엔드 키 맞춤
                      getValue(w, "하늘상태")
                    )}
                  </div>
                </div>
                <div className="weather-info">
                  <div className="info-item">
                    <div className="info-header">
                      <span className="info-label">습도</span>
                    </div>
                    <div className="info-value">{getValue(w, "습도") ?? "-"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-header">
                      <span className="info-label">풍속</span>
                    </div>
                    <div className="info-value">{getValue(w, "풍속") ?? "-"}</div>
                  </div>
                  <div className="info-item">
                    <div className="info-header">
                      <span className="info-label">강수상태</span>
                    </div>
                    <div className="info-value">
                      {getWeatherIcon(
                        getValue(w, "강수형태") || getValue(w, "강수상태"), // 수정
                        getValue(w, "하늘상태")
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
