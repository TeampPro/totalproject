// src/pages/My/MyPage.jsx

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api, apiFetch } from "../../api/http";

import "../../styles/My/MyPage.css";

import BackIcon from "../../assets/backIcon.svg";
import ProfileIcon from "../../assets/profileBig.svg";
import BorderIcon from "../../assets/border.svg";
import CreateIcon from "../../assets/create.svg";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    nickname: "",
    email: "",
    kakaoId: "",
    kakaoEmail: "",
    profileImage: null,
  });

  const [nickname, setNickname] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState("MEMBER");

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      alert("로그인이 필요합니다.");
      navigate("/login");
      return;
    }

    // userType 대문자로 통일 (GUEST/MEMBER/ADMIN ...)
    setUserType((savedUser.userType || "MEMBER").toUpperCase());

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
        console.error("프로필 불러오기 실패:", err);
        alert("프로필 정보를 불러오지 못했습니다.");
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

      alert(data?.message || "내 정보가 저장되었습니다.");
      setIsEditing(false);

      // 🔹 로컬 user 정보도 같이 업데이트
      const savedUser = JSON.parse(localStorage.getItem("user") || "null");
      const updatedUser = {
        ...savedUser,
        nickname,
        name: userInfo.name,
        email: userInfo.email,
        // 서버가 프로필 파일명 내려준다고 가정 (ex: "abc.png")
        profileImage: data?.profileImage ?? savedUser?.profileImage ?? null,
      };

      localStorage.setItem("user", JSON.stringify(updatedUser));

      // 상태도 동기화
      setUserInfo((prev) => ({
        ...prev,
        nickname,
        // 필요한 경우 profileImage도 상태에 넣기
        profileImage: updatedUser.profileImage,
      }));

      if (data?.profileImage) {
        setPreview(`${API_BASE}/api/uploads/${data.profileImage}`);
      }

    } catch (err) {
      console.error("내 정보 저장 실패:", err);
      alert(err.message || "내 정보 저장 중 오류가 발생했습니다.");
    }
  };

  // 🔽 여기 부분이 충돌 나던 곳: 두 브랜치 내용 합친 최종 버전
  const handlePasswordChange = async (e) => {
    if (e) e.preventDefault(); // Enter / 버튼 submit 시 새로고침 방지

    // 1) 기본 입력 체크
    if (!currentPassword || !newPassword || !confirmNewPassword) {
      alert(
        "현재 비밀번호, 새 비밀번호, 새 비밀번호 확인을 모두 입력해주세요."
      );
      return;
    }

    // 2) 새 비밀번호 일치 여부
    if (newPassword !== confirmNewPassword) {
      alert("새 비밀번호와 비밀번호 확인이 일치하지 않습니다.");
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

      // apiFetch는 JSON 파싱된 객체를 반환한다고 가정
      alert(
        data?.message || "비밀번호가 성공적으로 변경되었습니다."
      );

      // 입력값 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error("비밀번호 변경 요청 오류:", err);
      alert(err.message || "비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말 탈퇴하시겠습니까?")) return;

    try {
      const data = await apiFetch(`/api/user/delete/${userInfo.id}`, {
        method: "DELETE",
      });

      alert(data?.message || "회원 탈퇴가 완료되었습니다.");
      localStorage.removeItem("user");
      navigate("/");
    } catch (err) {
      console.error("회원 탈퇴 실패:", err);
      alert(err.message || "회원 탈퇴 중 오류가 발생했습니다.");
    }
  };

  const isGuest = userType === "GUEST";

  return (
    <div className="mypage-wrapper">
      {/* 왼쪽 상단 뒤로가기 */}
      <button
        type="button"
        className="mypage-back-icon-btn"
        onClick={() => navigate("/main")}
      >
        <img src={BackIcon} alt="뒤로가기" />
      </button>

      <div className="mypage-shell">
        {/* 프로필 아이콘 + 이름 */}
        <div className="mypage-profile-top">
          <div className="mypage-avatar">
            {/* 흰색/파란 테두리 svg */}
            <img src={BorderIcon} alt="" className="mypage-avatar-border" />

            {/* 안쪽 동그라미(실제 이미지) */}
            <div className="mypage-avatar-inner">
              {preview ? (
                <img src={preview} alt="프로필" />
              ) : (
                <img src={ProfileIcon} alt="프로필 기본" />
              )}
            </div>

            {/* 연필 아이콘 + 파일 입력 */}
            {!isGuest && (
              <label className="mypage-avatar-edit">
                <img src={CreateIcon} alt="프로필 수정" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>

          <div className="mypage-display-name">
            {nickname || userInfo.name || userInfo.id}
          </div>
        </div>

        {/* 가운데 파란 테두리 박스 */}
        <div className="mypage-main-panel">
          <div className="mypage-main-title">마이 페이지</div>

          <div className="mypage-info-grid">
            {/* 아이디 */}
            <div className="mypage-info-row">
              <div className="mypage-info-label">아이디</div>
              <div className="mypage-info-value">{userInfo.id}</div>
            </div>

            {/* 이름 */}
            <div className="mypage-info-row">
              <div className="mypage-info-label">이름</div>
              <div className="mypage-info-value">
                {isGuest || !isEditing ? (
                  userInfo.name
                ) : (
                  <input
                    name="name"
                    value={userInfo.name}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>

            {/* 닉네임 */}
            <div className="mypage-info-row">
              <div className="mypage-info-label">닉네임</div>
              <div className="mypage-info-value">
                {isGuest || !isEditing ? (
                  nickname
                ) : (
                  <input
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                  />
                )}
              </div>
            </div>

            {/* 이메일 */}
            <div className="mypage-info-row">
              <div className="mypage-info-label">이메일</div>
              <div className="mypage-info-value">
                {isGuest || !isEditing ? (
                  userInfo.email
                ) : (
                  <input
                    name="email"
                    value={userInfo.email}
                    onChange={handleChange}
                  />
                )}
              </div>
            </div>
          </div>

          {/* 내 정보 수정 버튼 */}
          {isGuest ? (
            <p className="mypage-warning">
              비회원은 프로필 정보를 수정할 수 없습니다.
            </p>
          ) : isEditing ? (
            <button className="mypage-main-btn" onClick={handleSave}>
              내 정보 저장
            </button>
          ) : (
            <button
              className="mypage-main-btn"
              onClick={() => setIsEditing(true)}
            >
              내 정보 수정
            </button>
          )}
        </div>

        {/* 비밀번호 변경 섹션 */}
        {!isGuest && (
          <form
            className="mypage-password-section"
            onSubmit={handlePasswordChange}
          >
            <div className="mypage-password-title">비밀번호 변경</div>

            <div className="mypage-password-fields">
              <input
                type="password"
                placeholder="현재 비밀번호"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="새 비밀번호"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <input
                type="password"
                placeholder="새 비밀번호 확인"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
              />
            </div>

            <button className="mypage-password-btn-new" type="submit">
              변경하기
            </button>
          </form>
        )}

        {/* 하단 버튼들 */}
        {!isGuest && (
          <button
            className="mypage-footer-btn mypage-footer-btn-danger"
            onClick={handleDeleteAccount}
          >
            회원 탈퇴
          </button>
        )}

        <button
          className="mypage-footer-btn mypage-footer-btn-secondary"
          onClick={() => navigate("/main")}
        >
          메인으로
        </button>
      </div>
    </div>
  );
}

export default MyPage;
