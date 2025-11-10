import { useEffect, useState } from "react";
import "../styles/WeatherBoard.css";

export default function WeatherBoard() {
  const [data, setData] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0); // 현재 보여줄 도시 인덱스
  const [loading, setLoading] = useState(true);
  // const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    const fetchData = () => {
      setLoading(true);
      fetch("http://localhost:8080/api/weather/multi")
        .then(res => res.json())
        .then(json => {
          setData(json);
          // setLastUpdate(new Date());
          setCurrentIndex(0);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    };

    fetchData();
    const refreshTimer = setInterval(fetchData, 60 * 60 * 1000); // 매 1시간마다 갱신
    return () => clearInterval(refreshTimer);
  }, []);

  // ✅ 자동으로 다음 카드로 전환
  useEffect(() => {
    if (data.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % data.length);
    }, 5000);   // 5초마다 카드전환
    return () => clearInterval(interval);
  }, [data]);

  if (loading) return <div className="loading">🌥️ 날씨 불러오는 중...</div>;

  const w = data[currentIndex]; // 현재 보여줄 날씨 데이터

  function formatDate(dateStr) {      // 날짜 분리
    const year = dateStr.slice(0,4);
    const month = dateStr.slice(4, 6);
    const day = dateStr.slice(6, 8)
    return `${year}/${month}/${day}`
  }

  return (
    <div className="page-container">
      <div className="weather-container">
        <h2 className="title">🌤️ 도시별 날씨</h2>

        <div className="card-wrapper">
          {w && (
            <div key={currentIndex} className="weather-card fade-in-out">
              <div className="city">{w["도시"]}</div>
              <div className="time">
                {formatDate(w["기준일자"])} {w["기준시각"]?.slice(0, 2)}:00 기준
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

        {/* <div className="update-time">
          마지막 업데이트: {lastUpdate?.toLocaleString("ko-KR")}
        </div> */}
      </div>
    </div>
  );
}

  function getWeatherIcon(pty, sky) {
  // 비, 눈 등 강수형태가 있으면 우선 표시
  if (pty && pty !== "없음") {
    switch (pty) {
      case "비": return "🌧️";
      case "비/눈": return "🌨️";
      case "눈": return "❄️";
      case "빗방울": return "💧";
      case "빗방울/눈날림": return "🌦️";
      case "눈날림": return "🌨️";
      default: return "🌧️";
    }
  }

  // 강수 없으면 하늘상태로 표시
  switch (sky) {
    case "맑음": return "☀️";
    case "구름많음": return "⛅";
    case "흐림": return "☁️";
    default: return "🌤️";
  }
}
