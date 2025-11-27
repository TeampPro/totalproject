import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/My/MyPage.css"; // 🔥 CSS 임포트
import { api, apiFetch } from "../../api/http";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    nickname: "",
    email: "",
    password: "",
    kakaoId: "",
    kakaoEmail: "",
    profileImage: null,
  });

  const [nickname, setNickname] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState("member");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      alert("???? ?????.");
      navigate("/");
      return;
    }
    setUserType(savedUser.userType || "member");

    const fetchProfile = async () => {
      try {
        const data = await api.get(`/api/user/${savedUser.id}`);

        setUserInfo({
          id: data.id || "",
          name: data.name || "",
          nickname: data.nickname || "",
          email: data.email || "",
          kakaoId: data.kakaoId || "",
          kakaoEmail: data.kakaoEmail || "",
          profileImage: null,
        });
        setNickname(data.nickname || "");

        if (data.profileImage) {
          setPreview(`${API_BASE}/api/uploads/${data.profileImage}`);
        }
      } catch (err) {
        console.error("??? ?? ?? ??:", err);
        alert("??? ??? ???? ?????.");
      }
    };

    fetchProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUserInfo((prev) => ({ ...prev, profileImage: file }));
    setPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("id", userInfo.id);
      formData.append("name", userInfo.name || "");
      formData.append("nickname", nickname || "");
      formData.append("email", userInfo.email || "");

      if (userInfo.profileImage instanceof File) {
        formData.append("profileImage", userInfo.profileImage);
      }

      const data = await apiFetch("/api/user/update-with-file", {
        method: "PUT",
        body: formData,
      });

      alert(data?.message || "?? ??? ???????.");
      setIsEditing(false);

      const savedUser = JSON.parse(localStorage.getItem("user"));
      localStorage.setItem("user",
        JSON.stringify({
          ...savedUser,
          nickname,
          name: userInfo.name,
          email: userInfo.email,
        })
      );

      setUserInfo((prev) => ({ ...prev, nickname }));
      if (data?.profileImage) {
        setPreview(`${API_BASE}/api/uploads/${data.profileImage}`);
      }
    } catch (err) {
      console.error("??? ?? ??:", err);
      alert("?? ??? ??????.");
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      alert("?? ????? ? ????? ?? ??? ???.");
      return;
    }

    try {
      const data = await apiFetch("/api/user/change-password", {
        method: "PUT",
        body: JSON.stringify({
          id: userInfo.id,
          currentPassword,
          newPassword,
        }),
      });

      alert(data?.message || "????? ???????.");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err) {
      console.error("???? ?? ??:", err);
      alert(err.message || "??? ??????.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("?? ?? ?? ???????")) return;

    try {
      const data = await apiFetch(`/api/user/delete/${userInfo.id}`, {
        method: "DELETE",
      });

      alert(data?.message || "?? ??? ???????.");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("?? ?? ??:", err);
      alert(err.message || "?? ??? ??????.");
    }
  };

  return (
    <div className="mypage-container">
      <div className="mypage-card">
        <h2 className="mypage-title">마이페이지</h2>
        
        <div className="mypage-profile-wrap">
          <img
            src={preview || "/default-profile.png"}
            alt="프로필"
            className="mypage-profile-img"
          />
          {userType !== "GUEST" && isEditing && (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>

        <div className="mypage-info">
          <label>아이디</label>
          <input value={userInfo.id} disabled className="mypage-input" />

          <label>이름</label>
          <input
            name="name"
            value={userInfo.name}
            disabled={!isEditing || userType === "guest"}
            onChange={handleChange}
            className="mypage-input"
          />

          <label>닉네임</label>
          <input
            value={nickname}
            disabled={!isEditing || userType === "guest"}
            onChange={(e) => setNickname(e.target.value)}
            className="mypage-input"
          />

          <label>이메일</label>
          <input
            name="email"
            value={userInfo.email}
            disabled={!isEditing || userType === "guest"}
            onChange={handleChange}
            className="mypage-input"
          />
        </div>

        {userType === "guest" ? (
          <p className="mypage-warning">⚠ 비회원은 정보 수정이 불가능합니다.</p>
        ) : isEditing ? (
          <button className="mypage-save-btn" onClick={handleSave}>
            저장하기
          </button>
        ) : (
          <button
            className="mypage-edit-btn"
            onClick={() => setIsEditing(true)}
          >
            수정하기
          </button>
        )}

        {userType !== "guest" && (
          <div className="mypage-password-box">
            <h4>비밀번호 변경</h4>

            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mypage-input"
            />

            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mypage-input"
            />

            <button
              className="mypage-password-btn"
              onClick={handlePasswordChange}
            >
              비밀번호 변경
            </button>
          </div>
        )}

        {userType !== "guest" && (
          <button className="mypage-delete-btn" onClick={handleDeleteAccount}>
            회원탈퇴
          </button>
        )}

        <button className="mypage-back-btn" onClick={() => navigate("/main")}>
          메인으로
        </button>
      </div>
    </div>
  );
}

export default MyPage;
