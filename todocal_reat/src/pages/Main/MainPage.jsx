import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";

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
      {/* 전체를 감싸는 투명 레이어 */}
      <div className="overlay-wrapper">
        {user && (
          <div className="menu-wrapper">
            <button
              className="menu-button"
              onClick={() => setMenuOpen((prev) => !prev)}
            >
              <div className="menu-bar"></div>
              <div className="menu-bar"></div>
              <div className="menu-bar"></div>
            </button>

            {menuOpen && (
              <div className="dropdown">
                {user?.userType === "ADMIN" && (
                  <button
                    className="dropdown-item"
                    onClick={() => navigate("/admin/users")}
                  >
                    회원관리
                  </button>
                )}

                <button
                  className="dropdown-item"
                  onClick={() => navigate("/myPage")}
                >
                  마이페이지
                </button>
                <button className="dropdown-item" onClick={handleLogout}>
                  로그아웃
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default MainPage;
