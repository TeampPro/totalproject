import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/serverbar/ServerBar.css";
import axios from "../../api/setupAxios";

import Logo from "../../assets/logo.svg";
import PlanixLogo from "../../assets/planix3.svg";
import BellIcon from "../../assets/bell.svg";
import ProfileIcon from "../../assets/profile.svg";
import ListIcon from "../../assets/list.svg";
import BackIcon from "../../assets/backIcon.svg";

/**
 * ServerBar
 *
 * - 항상 상단 가운데에 ;P Planix 로고
 * - 왼쪽: (옵션) 뒤로가기 버튼
 * - 오른쪽: 알림 / 프로필 / 메뉴
 * - 알림(종) 아이콘은 내부에서 일정 조회해서 뱃지 + 드롭다운까지 모두 처리
 *
 * props
 *  - showBackButton: true면 뒤로가기 버튼 표시 (기본 true)
 */
const ServerBar = ({ showBackButton = true }) => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);

  // 🔔 7일 이내 마감 일정
  const [urgentTodos, setUrgentTodos] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isAdmin = storedUser?.userType === "ADMIN";

  // ⬅ 뒤로가기
  const handleBackClick = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/main");
    }
  };

  // 🔐 로그아웃 / 마이페이지 / 관리자
  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  const handleMyPage = () => {
    navigate("/myPage");
  };

  const handleAdminUsers = () => {
    navigate("/admin/users");
  };

  // 🔔 알림용 일정 조회 (마운트 시 1번)
  useEffect(() => {
    const fetchUrgentTodos = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "null");
        if (!user?.id) {
          setUrgentTodos([]);
          return;
        }

        const res = await axios.get("/api/tasks", {
          params: { userId: user.id },
        });

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const urgent = (res.data || [])
          .filter((t) => t.promiseDate)
          .map((t) => {
            const target = new Date(t.promiseDate);
            target.setHours(0, 0, 0, 0);
            const diffDays = Math.round(
              (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );
            return { ...t, diffDays };
          })
          .filter((t) => t.diffDays >= 0 && t.diffDays <= 7 && !t.completed)
          .sort((a, b) => a.diffDays - b.diffDays);

        setUrgentTodos(urgent);
      } catch (err) {
        console.error("ServerBar 알림용 일정 조회 실패:", err);
      }
    };

    fetchUrgentTodos();
  }, []);

  // 🔔 종 버튼 클릭
  const handleBellClick = () => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      alert("로그인 후 일정 알림을 확인할 수 있습니다.");
      return;
    }
    setMenuOpen(false);

    setShowAlertDropdown((prev) => !prev);
  };

  // 🔔 알림 한 줄 클릭 → 해당 일정 페이지로 이동
  const handleClickAlertItem = (todo) => {
    setShowAlertDropdown(false);
    if (todo.shared) {
      navigate("/share");
    } else {
      navigate("/todo");
    }
  };

  return (
    <header className="server-bar">
      <div className="server-bar-inner">
        {/* 왼쪽: 뒤로가기 */}
        {showBackButton && (
          <button
            type="button"
            className="server-bar-back-btn"
            onClick={handleBackClick}
          >
            <img src={BackIcon} alt="뒤로가기" />
          </button>
        )}

        {/* 가운데: Planix 로고 */}
        <div className="server-bar-center">
          <img src={Logo} alt="logo" className="server-bar-logo" />
          <img src={PlanixLogo} alt="planix" className="server-bar-planix" />
        </div>

        {/* 오른쪽: 종 / 프로필 / 메뉴 */}
        <div className="server-bar-right">
          {/* 종 + 뱃지 */}
          <button
            type="button"
            className="server-bar-icon-btn"
            onClick={handleBellClick}
          >
            <img src={BellIcon} alt="알림" className="server-bar-icon" />
            {urgentTodos.length > 0 && (
              <span className="server-bar-badge">
                {urgentTodos.length > 9 ? "9+" : urgentTodos.length}
              </span>
            )}
          </button>

          {/* 프로필 */}
          <img
            src={ProfileIcon}
            alt="프로필"
            className="server-bar-icon"
            onClick={handleMyPage}
          />

          {/* 리스트 메뉴 */}
          <img
            src={ListIcon}
            alt="메뉴"
            className="server-bar-icon"
            onClick={() => {
              setShowAlertDropdown(false);
              setMenuOpen((prev) => !prev)
            }}
          />
        </div>

        {/* 리스트 드롭다운 */}
        {menuOpen && (
          <div className="server-bar-menu-dropdown">
            {isAdmin && (
              <button
                className="server-bar-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  handleAdminUsers();
                }}
              >
                회원관리
              </button>
            )}

            <button
              className="server-bar-menu-item"
              onClick={() => {
                setMenuOpen(false);
                handleMyPage();
              }}
            >
              마이페이지
            </button>

            <button
              className="server-bar-menu-item"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 🔔 알림 드롭다운 (메인에서 쓰던 alert-* 클래스 그대로 사용) */}
        {showAlertDropdown && (
          <div className="alert-dropdown">
            <div className="alert-dropdown-header">7일 이내 마감 일정</div>

            {urgentTodos.length === 0 ? (
              <div className="alert-dropdown-empty">
                곧 마감되는 일정이 없습니다.
              </div>
            ) : (
              <ul className="alert-dropdown-list">
                {urgentTodos.map((todo) => (
                  <li
                    key={todo.id}
                    className="alert-dropdown-item"
                    onClick={() => handleClickAlertItem(todo)}
                  >
                    <span className="alert-dday">
                      {todo.diffDays === 0 ? "D-Day" : `D-${todo.diffDays}`}
                    </span>
                    <span className="alert-title">{todo.title}</span>
                    <span className="alert-date">
                      {todo.promiseDate
                        ? todo.promiseDate.substring(5, 10).replace("-", "/")
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default ServerBar;
