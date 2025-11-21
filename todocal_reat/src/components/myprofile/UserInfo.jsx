import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/myprofile/UserInfo.css";

function UserInfo({ onLogout }) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      const parsed = raw ? JSON.parse(raw) : null;

      if (!parsed) {
        navigate("/");
        return;
      }

      axios
        .get(`${API_BASE_URL}/api/user/${parsed.id}`)
        .then((res) => setUserInfo(res.data))
        .catch((err) => console.error("유저 정보 불러오기 실패:", err));
    } catch (e) {
      console.error("user 파싱 실패:", e);
      navigate("/");
    }
  }, [navigate, API_BASE_URL]);

  const handleMyPage = () => navigate("/myPage");

  if (!userInfo) {
    return (
      <div className="loading-box">
        <p>내 정보 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="profile-section">
        <img
          src={
            userInfo.profileImage
              ? `${API_BASE_URL}/api/uploads/${userInfo.profileImage}`
              : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="프로필"
          className="profile-image"
        />

        <div className="info-box">
          <h2 className="name">이름: {userInfo.name || "이름 미등록"}</h2>

          <p className="info-text">
            <strong>아이디:</strong> {userInfo.id || "미등록"}
          </p>

          <p className="info-text">
            <strong>이메일:</strong>{" "}
            {userInfo.email || userInfo.kakaoEmail || "미등록"}
          </p>

          <p className="info-text">
            <strong>카카오 연동:</strong>{" "}
            {userInfo.userType === "KAKAO" ? "✅ 연동됨" : "❌ 일반 회원"}
          </p>
        </div>
      </div>

      <div className="button-group">
        <button className="my-page-btn" onClick={handleMyPage}>
          마이페이지
        </button>

        <button
          className="logout-btn"
          onClick={() => {
            console.log("작동");
            onLogout();
          }}
        >
          로그아웃
        </button>
      </div>
    </div>
  );
}

export default UserInfo;
