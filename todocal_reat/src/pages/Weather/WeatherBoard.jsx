import { useEffect, useState } from "react";
import "../../styles/Weather/WeatherBoard.css";

export default function WeatherBoard() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  // ✅ 날씨 데이터 요청 함수
  const fetchData = () => {
    setLoading(true);
    fetch("/api/weather/multi")
      .then((res) => res.json())
      .then((json) => {
        if (json.status === "warming-up") {
          // 백엔드 캐시 준비 중
          setMessage("⏳ 날씨 정보를 준비 중입니다. 잠시 후 자동으로 업데이트됩니다.");
          setData([]);
          setTimeout(fetchData, 60 * 1000); // 1분 후 재시도
        } else if (Array.isArray(json) && json.length > 0) {
          setData(json);
          setCurrentIndex(0);
          setMessage("");
        } else {
          setMessage("⚠️ 날씨 데이터를 불러오지 못했습니다.");
        }
      })
      .catch(() => {
        setMessage("❌ 서버 연결이 원활하지 않습니다. 잠시 후 다시 시도해주세요.");
        setTimeout(fetchData, 60 * 1000); // 오류 발생 시 1분 후 재시도
      })
      .finally(() => setLoading(false));
  };

  // ✅ 컴포넌트 마운트 시 데이터 요청 및 주기적 갱신
  useEffect(() => {
    fetchData();
    const refreshTimer = setInterval(fetchData, 60 * 60 * 1000); // 1시간마다 자동 갱신
    return () => clearInterval(refreshTimer);
  }, []);

  // ✅ 5초마다 도시 전환
  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % data.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [data]);

  // ✅ 상태별 표시
  if (loading) return <div className="loading">🌥️ 날씨 불러오는 중...</div>;
  if (message) return <div className="loading">{message}</div>;
  if (data.length === 0) return <div className="loading">⚠️ 표시할 날씨 데이터가 없습니다.</div>;

  const w = data[currentIndex];

  // ✅ 안전한 날짜 포맷 함수
  function formatDate(dateStr) {
    if (!dateStr || typeof dateStr !== "string") return "날짜 정보 없음";
    const year = dateStr.slice(0, 4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8);
    return `${year}/${month}/${day}`;
  }

  return (
    <div className="page-container">
      <div className="weather-container">
        <h2 className="title">🌤️ 도시별 날씨</h2>

        <div className="card-wrapper">
          {w && (
            <div key={currentIndex} className="weather-card fade-in-out">
              <div className="city">{w["도시"] ?? "도시명 없음"}</div>
              <div className="time">
                {formatDate(w["기준일자"])}{" "}
                {w["기준시각"]?.slice(0, 2) ?? "??"}:00 기준
              </div>

              <div className="icon">
                {getWeatherIcon(w["강수형태"], w["하늘상태"])}
              </div>

              <div className="weather-info">
                <div className="row">
                  <div>🌡️ {w["기온"] ?? "-"}</div>
                  <div>💧 {w["습도"] ?? "-"}</div>
                </div>
                <div className="row">
                  <div>🌬️ {w["풍속"] ?? "-"}</div>
                  <div>☔ {w["강수형태"] ?? "-"}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ✅ 날씨 아이콘 표시 함수
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
