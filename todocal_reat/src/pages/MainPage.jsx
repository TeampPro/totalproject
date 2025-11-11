import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function MainPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  // ✅ 로그인 정보 확인
  useEffect(() => {
    const savedUser = JSON.parse(localStorage.getItem("user"));
    if (!savedUser) {
      alert("로그인이 필요합니다.");
      navigate("/");
      return;
    }
    setUser(savedUser);
  }, [navigate]);

  // ✅ 로그아웃 기능
  const handleLogout = () => {
    localStorage.removeItem("user");
    alert("로그아웃 되었습니다.");
    navigate("/");
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>메인 페이지 🏠</h1>
      {user && (
        <p style={styles.welcome}>
          안녕하세요, <b>{user.name || user.id}</b>님!
        </p>
      )}

      {/* ✅ 햄버거 버튼 */}
      {user && (
        <div style={styles.menuWrapper}>
          <button
            style={styles.menuButton}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
            <div style={styles.bar}></div>
          </button>

          {/* ✅ 펼쳐지는 메뉴 */}
          {menuOpen && (
            <div style={styles.dropdown}>
              <button
                style={styles.dropdownItem}
                onClick={() => navigate("/mypage")}
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
    </div>
  );
}

const styles = {
  container: {
    textAlign: "center",
    marginTop: "100px",
    fontFamily: "Arial, sans-serif",
  },
  title: { fontSize: "2rem", color: "#333" },
  welcome: { fontSize: "1.2rem", marginTop: "10px" },

  // ✅ 햄버거 메뉴 관련
  menuWrapper: {
    position: "fixed",
    bottom: "20px",
    right: "20px",
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
  },
  dropdownItem: {
    background: "none",
    border: "none",
    padding: "10px 20px",
    textAlign: "left",
    cursor: "pointer",
    fontSize: "15px",
  },
};

export default MainPage;
