import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MyPage() {
  const [userInfo, setUserInfo] = useState({
    id: "",
    name: "",
    email: "",
    password: "",
    kakaoId: "",
    kakaoEmail: "",
    profileImage: null,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [userType, setUserType] = useState("member");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [preview, setPreview] = useState(null);
  const navigate = useNavigate();

  // 로그인된 사용자 정보 불러오기
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }

    setUserType(savedUser.userType || "member");

    // 유저 정보 가져오기
    fetch(`http://localhost:8080/api/user/${savedUser.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("사용자 정보 조회 실패");
        return res.json();
      })
      .then((data) => {
        setUserInfo({
          id: data.id || "",
          name: data.name || "",
          email: data.email || "",
          password: "", // 비밀번호는 클라이언트에 채우지 않음
          kakaoId: data.kakaoId || "",
          kakaoEmail: data.kakaoEmail || "",
          profileImage: null, // 서버에서의 파일명은 profileImage 필드로 따로 보관
        });

        if (data.profileImage) {
          setPreview(`http://localhost:8080/api/uploads/${data.profileImage}`);
        } else {
          setPreview(null);
        }
      })
      .catch((err) => {
        console.error(err);
        alert("사용자 정보를 불러오는데 실패했습니다.");
      });
  }, [navigate]);

  // 입력 변경 핸들러
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prev) => ({ ...prev, [name]: value }));
  };

  // 프로필 이미지 선택 (안전 처리)
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
      formData.append("email", userInfo.email || "");
      // 파일이 실제 File 객체일 때만 append
      if (userInfo.profileImage instanceof File) {
        formData.append("profileImage", userInfo.profileImage);
      }

      const response = await fetch(
        "http://localhost:8080/api/user/update-with-file",
        {
          method: "PUT",
          body: formData, // 절대 headers에 Content-Type 직접 지정하지 않음
        }
      );

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        alert(data.message || "회원 정보가 성공적으로 수정되었습니다.");
        setIsEditing(false);

        // 서버에서 최신 정보 재조회 (프로필 이미지 파일명 반영 위해)
        const savedUser = JSON.parse(localStorage.getItem("user"));
        if (savedUser?.id) {
          fetch(`http://localhost:8080/api/user/${savedUser.id}`)
            .then((res) => res.json())
            .then((d) => {
              setUserInfo((prev) => ({
                ...prev,
                name: d.name || "",
                email: d.email || "",
                profileImage: null,
              }));
              if (d.profileImage) {
                setPreview(`http://localhost:8080/api/uploads/${d.profileImage}`);
              }
            })
            .catch((err) => console.error("재조회 실패:", err));
        }
      } else {
        alert(data.message || "수정 실패");
      }
    } catch (error) {
      console.error(error);
      alert("서버 오류 발생");
    }
  };

  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      alert("현재 비밀번호와 새 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:8080/api/user/change-password",
        {
          method: "PUT", // 백엔드가 PUT 으로 받음
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: userInfo.id,
            currentPassword,
            newPassword,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.message || "비밀번호가 변경되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        alert(data.message || "비밀번호 변경 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류 발생");
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("정말로 회원탈퇴 하시겠습니까?")) return;
    try {
      const res = await fetch(`http://localhost:8080/api/user/delete/${userInfo.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        alert(data.message || "회원탈퇴가 완료되었습니다.");
        localStorage.removeItem("user");
        navigate("/");
      } else {
        alert(data.message || "회원탈퇴 실패");
      }
    } catch (err) {
      console.error(err);
      alert("서버 오류");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>마이페이지</h2>

        {/* 프로필 이미지 */}
        <div style={{ marginBottom: "20px" }}>
          <img
            src={preview || "/default-profile.png"}
            alt="프로필"
            style={styles.profileImage}
          />
          {userType !== "guest" && isEditing && (
            <input type="file" accept="image/*" onChange={handleImageChange} />
          )}
        </div>

        {/* 정보 입력 */}
        <div style={styles.infoGroup}>
          <label>아이디</label>
          <input type="text" value={userInfo.id} disabled style={styles.input} />
        </div>
        <div style={styles.infoGroup}>
          <label>이름</label>
          <input
            type="text"
            name="name"
            value={userInfo.name || ""}
            onChange={handleChange}
            disabled={!isEditing || userType === "guest"}
            style={styles.input}
          />
        </div>
        <div style={styles.infoGroup}>
          <label>이메일</label>
          <input
            type="email"
            name="email"
            value={userInfo.email || ""}
            onChange={handleChange}
            disabled={!isEditing || userType === "guest"}
            style={styles.input}
          />
        </div>
        {userType === "guest" ? (
          <p style={styles.warning}>⚠️ 비회원은 정보 수정이 불가능합니다.</p>
        ) : (
          <>
            {isEditing ? (
              <button style={styles.saveButton} onClick={handleSave}>
                저장하기
              </button>
            ) : (
              <button
                style={styles.editButton}
                onClick={() => setIsEditing(true)}
              >
                수정하기
              </button>
            )}
          </>
        )}

        {/* 비밀번호 변경 섹션 */}
        {userType !== "guest" && (
          <div style={styles.passwordBox}>
            <h4>비밀번호 변경</h4>
            <input
              type="password"
              placeholder="현재 비밀번호"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              style={styles.input}
            />
            <input
              type="password"
              placeholder="새 비밀번호"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              style={styles.input}
            />
            <button style={styles.passwordButton} onClick={handlePasswordChange}>
              비밀번호 변경
            </button>
          </div>
        )}

        {/* 회원탈퇴 */}
        {userType !== "guest" && (
          <button style={styles.deleteButton} onClick={handleDeleteAccount}>
            회원탈퇴
          </button>
        )}
        <button style={styles.backButton} onClick={() => navigate("/main")}>
          메인으로
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f8f9fa",
  },
  card: {
    background: "#fff",
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
    width: "400px",
    textAlign: "center",
  },
  title: { marginBottom: "25px", color: "#333" },
  infoGroup: { marginBottom: "15px", textAlign: "left" },
  input: {
    width: "100%",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid #ccc",
    marginTop: "5px",
  },
  profileImage: {
    width: "120px",
    height: "120px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid #ddd",
  },
  editButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
  saveButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#28a745",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
  passwordBox: {
    marginTop: "25px",
    paddingTop: "15px",
    borderTop: "1px solid #ccc",
    textAlign: "left",
  },
  passwordButton: {
    width: "100%",
    padding: "10px",
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "8px",
    marginTop: "10px",
    cursor: "pointer",
    color: "#fff",
  },
  deleteButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#dc3545",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "20px",
  },
  backButton: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#6c757d",
    color: "#fff",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginTop: "10px",
  },
  warning: {
    color: "#dc3545",
    marginTop: "15px",
    fontWeight: "bold",
  },
};

export default MyPage;
