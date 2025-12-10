import { useEffect, useState, useRef } from "react";
import "../../styles/Map/KakaoMapBox.css";
import searchIcon from "../../assets/search.svg";
import locationIcon from "../../assets/location.svg";

function KakaoMapBox() {
  const [map, setMap] = useState(null);
  const [search, setSearch] = useState("");
  const [mapType, setMapType] = useState("roadmap");
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const infoWindowRef = useRef(null);

  // Kakao SDK 로드
  useEffect(() => {
    const loadMap = () => window.kakao.maps.load(initMap);

    if (window.kakao && window.kakao.maps) {
      loadMap();
      return;
    }

    const existing = document.getElementById("kakao-map-sdk");
    if (existing) {
      existing.addEventListener("load", loadMap, { once: true });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-sdk";
    script.src =
      "https://dapi.kakao.com/v2/maps/sdk.js?appkey=003886aac0beda9c1fe23ae6ece8b689&autoload=false&libraries=services";
    script.async = true;
    document.head.appendChild(script);

    script.onload = loadMap;
  }, []);

  // 지도 초기화
  const initMap = () => {
    const container = mapRef.current;
    if (!container) return;

    const options = {
      center: new window.kakao.maps.LatLng(33.450701, 126.570667),
      level: 3,
    };

    const createdMap = new window.kakao.maps.Map(container, options);
    setMap(createdMap);

    const markerPosition = new window.kakao.maps.LatLng(33.450701, 126.570667);
    const marker = new window.kakao.maps.Marker({ position: markerPosition });
    marker.setMap(createdMap);
    markerRef.current = marker;
  };

  // 장소 검색
  const handleSearch = (e) => {
    e.preventDefault();
    if (!map || !search.trim()) return;

    const ps = new window.kakao.maps.services.Places();
    ps.keywordSearch(search, (data, status) => {
      if (status === window.kakao.maps.services.Status.OK) {
        const first = data[0];
        const moveLatLon = new window.kakao.maps.LatLng(first.y, first.x);
        map.setCenter(moveLatLon);

        if (markerRef.current) markerRef.current.setMap(null);
        if (infoWindowRef.current) infoWindowRef.current.close();

        const marker = new window.kakao.maps.Marker({
          map,
          position: moveLatLon,
        });
        markerRef.current = marker;

        const placeName = first.place_name || "이름 정보 없음";
        const address =
          first.road_address_name || first.address_name || "주소 정보 없음";
        const phone = first.phone || "전화번호 없음";

        const mapLink = `https://map.kakao.com/link/map/${placeName},${first.y},${first.x}`;
        const toLink = `https://map.kakao.com/link/to/${placeName},${first.y},${first.x}`;

        const iwContent = `
          <div class="map-iw">
            <div class="map-iw-title">${placeName}</div>
            <div class="map-iw-line">📞 ${phone}</div>
            <div class="map-iw-line">📍 ${address}</div>
            <div class="map-iw-links">
              <a href="${mapLink}" target="_blank">큰지도보기</a>
              <a href="${toLink}" target="_blank">길찾기</a>
            </div>
          </div>
        `;


        const infowindow = new window.kakao.maps.InfoWindow({
          content: iwContent,
        });
        infowindow.open(map, marker);
        infoWindowRef.current = infowindow;
      } else {
        alert("검색 결과가 없습니다.");
      }
    });
  };

  // 지도 타입 전환
  const handleMapTypeChange = (type) => {
    if (!map) return;
    if (type === "roadmap") {
      map.setMapTypeId(window.kakao.maps.MapTypeId.ROADMAP);
      setMapType("roadmap");
    } else {
      map.setMapTypeId(window.kakao.maps.MapTypeId.HYBRID);
      setMapType("skyview");
    }
  };

  // 확대/축소
  const zoomIn = () => {
    if (!map) return;
    map.setLevel(map.getLevel() - 1);
  };

  const zoomOut = () => {
    if (!map) return;
    map.setLevel(map.getLevel() + 1);
  };

  return (
    <div className="map-container">
      {/* 검색창 */}
      <div className="map-search-wrapper">
        <form onSubmit={handleSearch} className="map-search-form">
          <div className="map-search-inner">
            {/* 왼쪽 위치 아이콘 */}
            <img
              src={locationIcon}
              alt="location"
              className="map-location-icon"
            />

            <input
              type="text"
              placeholder="위치를 찾아서 Planix 일정에 추가해보세요 !"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="map-input"
            />

            {/* 오른쪽 검색 버튼 */}
            <button type="submit" className="map-search-button">
              <img src={searchIcon} alt="search" />
            </button>
          </div>
        </form>
      </div>

      {/* 지도 카드 */}
      <div className="map-card">
        {/* 일반지도 / 위성뷰 토글 (맵 상단 좌측) */}
        <div className="map-control-maptype">
          <button
            type="button"
            className={
              mapType === "roadmap" ? "map-type-btn active" : "map-type-btn"
            }
            onClick={() => handleMapTypeChange("roadmap")}
          >
            일반지도
          </button>
          <button
            type="button"
            className={
              mapType === "skyview" ? "map-type-btn active" : "map-type-btn"
            }
            onClick={() => handleMapTypeChange("skyview")}
          >
            위성뷰
          </button>
        </div>

        {/* 확대 / 축소 버튼 (맵 상단 우측) */}
        <div className="map-control-zoom">
          <button type="button" className="zoom-btn" onClick={zoomIn}>
            +
          </button>
          <div className="zoom-divider" />
          <button type="button" className="zoom-btn" onClick={zoomOut}>
            -
          </button>
        </div>

        {/* 실제 카카오 지도 영역 */}
        <div id="mapBox" ref={mapRef} className="map-box" />
      </div>
    </div>
  );
}

export default KakaoMapBox;
