import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/myprofile/UserInfo.css";

function UserInfo({ user, onLogout, small }) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (!user) return;

    axios
      .get(`${API_BASE_URL}/api/user/${user.id}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => console.error("유저 정보 불러오기 실패:", err));
  }, [user, API_BASE_URL]);

  const handleMyPage = () => navigate("/myPage");

  if (!userInfo) {
    return (
      <div className={`loading-box ${small ? "small" : ""}`}>
        <p>내 정보 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className={`user-info-container ${small ? "small" : ""}`}>
      <div className="profile-section">
        <img
          src={
            userInfo.profileImage
              ? `${API_BASE_URL}/api/uploads/${userInfo.profileImage}`
              : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="프로필"
          className={`profile-image ${small ? "small" : ""}`}
        />

        <div className="info-box">
          <h2 className={`name ${small ? "small" : ""}`}>{userInfo.name} 님</h2>

          {!small && (
            <>
              <p className="info-text">
                <strong>아이디:</strong> {userInfo.id}
              </p>
              <p className="info-text">
                <strong>이메일:</strong> {userInfo.email || userInfo.kakaoEmail}
              </p>
            </>
          )}
        </div>
      </div>

      {!small && (
        <div className="button-group">
          <button className="my-page-btn" onClick={handleMyPage}>
            마이페이지
          </button>

          <button className="logout-btn" onClick={onLogout}>
            로그아웃
          </button>
        </div>
      )}
    </div>
  );
}

export default UserInfo;
