import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

function UserInfo({ onLogout }) {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  // ✅ 안전한 user 파싱
  const user = (() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  })();

  // ✅ API baseURL 환경변수
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

  useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    axios
      .get(`${API_BASE_URL}/api/user/${user.id}`)
      .then((res) => setUserInfo(res.data))
      .catch((err) => console.error("유저 정보 불러오기 실패:", err));
  }, [user, navigate, API_BASE_URL]);

  const handleMyPage = () => navigate("/myPage");

  if (!userInfo) {
    return (
      <div style={styles.loadingBox}>
        <p>내 정보 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.profileSection}>
        <img
          src={
            userInfo.profileImage
              ? `${API_BASE_URL}/api/uploads/${userInfo.profileImage}`
              : "https://cdn-icons-png.flaticon.com/512/847/847969.png"
          }
          alt="프로필"
          style={styles.profileImage}
        />
        <div style={styles.infoBox}>
          <h2 style={styles.name}>이름: {userInfo.name || "이름 미등록"}</h2>
          <p style={styles.infoText}>
            <strong>아이디:</strong> {userInfo.id || "미등록"}
          </p>
          <p style={styles.infoText}>
            <strong>이메일:</strong>{" "}
            {userInfo.email || userInfo.kakaoEmail || "미등록"}
          </p>
          <p style={styles.infoText}>
            <strong>카카오 연동:</strong>{" "}
            {userInfo.userType === "KAKAO" ? "✅ 연동됨" : "❌ 일반 회원"}
          </p>
        </div>
      </div>

      <div style={styles.buttonGroup}>
        <button style={styles.myPageBtn} onClick={handleMyPage}>
          마이페이지
        </button>
        <button style={styles.logoutBtn} onClick={onLogout}>
          로그아웃
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    width: "500px",
    margin: "40px auto",
    padding: "30px",
    borderRadius: "20px",
    backgroundColor: "#fff",
    boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  profileSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px",
  },
  profileImage: {
    width: "100px",
    height: "100px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #007bff",
  },
  infoBox: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  name: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "bold",
  },
  infoText: {
    margin: 0,
    fontSize: "15px",
  },
  buttonGroup: {
    marginTop: "25px",
    display: "flex",
    gap: "10px",
  },
  myPageBtn: {
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  logoutBtn: {
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    padding: "10px 16px",
    cursor: "pointer",
  },
  loadingBox: {
    textAlign: "center",
    marginTop: "100px",
  },
};

export default UserInfo;
