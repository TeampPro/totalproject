import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import UserInfo from "../../myprofile/UserInfo";

const MainPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    try {
      const savedUser = JSON.parse(localStorage.getItem("user"));
      if (!savedUser) {
        alert("로그인이 필요합니다.");
        navigate("/");
        return;
      }
      setUser(savedUser);
    } catch {
      localStorage.removeItem("user");
      navigate("/");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <>
      {/* ✅ 상단 유저 정보 표시 */}
      <div style={styles.userInfoWrapper}>
        <UserInfo onLogout={handleLogout} />
      </div>

      {/* ✅ 우측 하단 플로팅 메뉴 */}
      {user && (
        <div style={styles.menuWrapper}>
          <button
            style={styles.menuButton}
            onClick={() => setMenuOpen((prev) => !prev)}
          >
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
          </button>

          {menuOpen && (
            <div style={styles.dropdown}>
              {/* ✅ 관리자 전용 메뉴 */}
              {user?.userType === "ADMIN" && (
                <button
                  style={styles.dropdownItem}
                  onClick={() => navigate("/admin/users")}  // 회원관리 페이지(추후 구현)
                >
                  회원관리
                </button>
              )}

              <button
                style={styles.dropdownItem}
                onClick={() => navigate("/myPage")}
              >
                마이페이지
              </button>
              <button style={styles.dropdownItem} onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};

const styles = {
  userInfoWrapper: {
    marginTop: "60px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  menuWrapper: {
    position: "fixed",
    bottom: "80px",
    right: "20px",
    zIndex: 100,
  },
  menuButton: {
    backgroundColor: "#007bff",
    border: "none",
    borderRadius: "50%",
    width: "60px",
    height: "60px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)",
  },
  bar: {
    width: "30px",
    height: "4px",
    backgroundColor: "#fff",
    margin: "3px 0",
    borderRadius: "2px",
  },
  dropdown: {
    position: "absolute",
    bottom: "75px",
    right: "0",
    backgroundColor: "#fff",
    border: "1px solid #ddd",
    borderRadius: "10px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    padding: "5px 0",
    zIndex: 10,
    minWidth: "120px",
  },
  dropdownItem: {
    background: "none",
    border: "none",
    padding: "8px 16px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "14px",
    whiteSpace: "nowrap",
  },
};

export default MainPage;
