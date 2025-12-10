import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../../api/setupAxios";
import { BASE_URL } from "../../api/http"; // ✅ 공통 BASE_URL 사용

import "../../styles/myprofile/UserInfo.css";
import profileIcon from "../../assets/profileBig.svg";
import smileIcon from "../../assets/smile.svg";
import logoutBtn from "../../assets/logout.svg";
import round from "../../assets/round.svg";

// ✅ profileImage 값 어떤 형태든 안전하게 URL 만들어 주는 함수
const buildProfileUrl = (raw) => {
  if (!raw) return null;

  // 이미 절대 URL이면 그대로
  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  // "/api/uploads/xxx" 같이 슬래시로 시작하면 BASE_URL만 앞에 붙이기
  if (raw.startsWith("/")) {
    return `${BASE_URL}${raw}`;
  }

  // 파일명만 오는 경우 (예: "admin_1234.png")
  return `${BASE_URL}/api/uploads/${raw}`;
};

function UserInfo({ user, onLogout, small }) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    if (!user) return;

    axios
      .get(`/api/user/${user.id}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => console.error("유저 정보 불러오기 실패:", err));
  }, [user]);

  const handleMyPage = () => navigate("/myPage");

  if (!userInfo) {
    return (
      <div className={`loading-box ${small ? "small" : ""}`}>
        <p>내 정보 불러오는 중...</p>
      </div>
    );
  }

  // ===== small 모드 (예: 채팅방 등에서 사용) =====
  if (small) {
    return (
      <div className="user-info-container small">
        <div className="profile-section">
          <img
            src={
              buildProfileUrl(userInfo.profileImage) ||
              "https://cdn-icons-png.flaticon.com/512/847/847969.png"
            }
            alt="프로필"
            className="profile-image small"
          />
          <div className="info-box">
            <h2 className="name small">{userInfo.name} 님</h2>
            <p className="info-text">
              <strong>아이디:</strong> {userInfo.id}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ===== 기본(메인) 카드 =====
  return (
    <div className="user-info-container">
      {/* 상단 인사말 */}
      <p className="welcome-text">{userInfo.name}님, 환영합니다.</p>

      {/* 가운데 프로필 영역 */}
      <div className="profile-section">
        <div className="avatar-ring">
          {/* 파란 원 배경 */}
          <img src={round} alt="avatar-round" className="avatar-round" />

          {/* 프로필 이미지 (없으면 기본 아이콘) */}
          <img
            src={buildProfileUrl(userInfo.profileImage) || profileIcon}
            alt="프로필"
            className="profile-image"
          />
        </div>

        <div className="info-box">
          <h2 className="name">{userInfo.nickname}</h2>
          <p className="info-text id-text">{userInfo.id}</p>
        </div>
      </div>

      {/* 아래 버튼 두 개 */}
      <div className="button-group">
        <button className="my-page-btn" onClick={handleMyPage}>
          <img src={smileIcon} alt="smile" />
          마이페이지
        </button>
        <button className="logout-btn" onClick={onLogout}>
          <img src={logoutBtn} alt="logout" />
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default UserInfo;
