import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Main/MainPage.css";
import axios from "../../api/setupAxios.js";
import moment from "moment";
import "moment/locale/ko";
moment.locale("ko");

import WebSearch from "../../components/Search/WebSearch";
import TimeHome from "../../components/TimeCalendar/TimeHome";
import WeatherBoard from "../../pages/Weather/WeatherBoard";
import KakaoMapBox from "../../pages/Map/KakaoMapBox";
import BoardHome from "../../pages/Board/BoardHome.jsx";

import RightAuthBox from "../../components/RightAuthBox/RightAuthBox.jsx";
import UserInfo from "../../components/myprofile/UserInfo.jsx";
import TopBar from "../../components/TopBar/TopBar.jsx";
import TodoPanel from "../Todo/TodoPanel.jsx";
import TimeViewPage from "../../components/TimeCalendar/TimeViewPage.jsx";
import {
  fetchFriendRequests,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../api/friendApi";

const MainPage = ({ user, setUser }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const calendarRef = useRef(null);

  // 🔑 이 값이 바뀔 때마다 TimeView / 알림을 다시 불러옴
  const [todoReloadKey, setTodoReloadKey] = useState(0);
  const [selectedDate, setSelectedDate] = useState(moment());

  // 7일 이내 마감 일정 리스트 (알림용)
  const [urgentTodos, setUrgentTodos] = useState([]);
  // 받은 친구 요청 리스트
  const [friendRequests, setFriendRequests] = useState([]);
  const [showAlertDropdown, setShowAlertDropdown] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    setUser(null);
    alert("로그아웃 되었습니다.");
    navigate("/login");
  };

  // 알림 한 줄 클릭 시 (일정)
  const handleClickAlertItem = (todo) => {
    setShowAlertDropdown(false);
    if (todo.shared) {
      navigate("/share");
    } else {
      navigate("/todo");
    }
  };

  // 🔁 7일 이내 마감 일정 조회
  const fetchUrgentTodos = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!storedUser?.id) {
        setUrgentTodos([]);
        return;
      }

      const res = await axios.get("/api/tasks", {
        params: { userId: storedUser.id },
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
    } catch (error) {
      console.error("메인 알림용 일정 조회 실패:", error);
    }
  };

  // 친구요청에서 이름 표시용
  const getFriendRequestName = (r) =>
    r.fromNickname ||
    r.fromName ||
    r.fromId ||
    r.requesterNickname ||
    r.requesterName ||
    r.requesterLoginId ||
    r.requesterId ||
    "알 수 없는 사용자";

  // 받은 친구 요청 조회
  const fetchFriendRequestsData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user") || "null");
      if (!storedUser?.id) {
        setFriendRequests([]);
        return;
      }
      const data = await fetchFriendRequests(storedUser.id);
      setFriendRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("친구 요청 목록 조회 실패:", error);
    }
  };

  useEffect(() => {
    fetchUrgentTodos();
    fetchFriendRequestsData();
  }, [user, todoReloadKey]);

  // ✅ TodoPanel에서 “일정이 업데이트 됨”을 알려줄 때 사용하는 콜백
  const handleTodoUpdated = (updatedTodo) => {
    setTodoReloadKey((prev) => prev + 1); // TimeView 등 재로딩

    // 상단 알림 리스트도 즉시 반영
    setUrgentTodos((prev) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const nextList = prev.filter((t) => t.id !== updatedTodo.id);

      if (updatedTodo.promiseDate && !updatedTodo.completed) {
        const target = new Date(updatedTodo.promiseDate);
        target.setHours(0, 0, 0, 0);
        const diffDays = Math.round(
          (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (diffDays >= 0 && diffDays <= 7) {
          nextList.push({ ...updatedTodo, diffDays });
        }
      }

      nextList.sort((a, b) => a.diffDays - b.diffDays);
      return nextList;
    });
  };

  // ✅ TodoPanel에서 “일정이 삭제됨”을 알려줄 때 사용하는 콜백
  const handleTodoDeleted = (deletedId) => {
    setTodoReloadKey((prev) => prev + 1); // TimeView 등 재로딩
    setUrgentTodos((prev) => prev.filter((t) => t.id !== deletedId)); // 알림에서 바로 제거
  };

  // 친구 요청 수락
const handleAcceptFriendRequest = async (requestId) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const myId = storedUser?.id;
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!requestId) {
      console.error("친구 요청 ID가 없습니다:", requestId);
      alert("요청 ID를 찾을 수 없습니다.");
      return;
    }

    await acceptFriendRequest(requestId, myId);

    // 알림 목록에서 해당 요청 제거
    setFriendRequests((prev) =>
      prev.filter((r) => r.requestId !== requestId)
    );

    alert("친구 요청을 수락했습니다.");
  } catch (error) {
    console.error("친구 요청 수락 실패:", error);
    alert("친구 요청 수락 중 오류가 발생했습니다.");
  }
};

// 친구 요청 거절
const handleRejectFriendRequest = async (requestId) => {
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const myId = storedUser?.id;
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!requestId) {
      console.error("친구 요청 ID가 없습니다:", requestId);
      alert("요청 ID를 찾을 수 없습니다.");
      return;
    }

    await rejectFriendRequest(requestId, myId);

    setFriendRequests((prev) =>
      prev.filter((r) => r.requestId !== requestId)
    );
  } catch (error) {
    console.error("친구 요청 거절 실패:", error);
    alert("친구 요청 거절 중 오류가 발생했습니다.");
  }
};


  const totalNotificationCount = urgentTodos.length + friendRequests.length;

  return (
    <div className="page-root">
      <div className="page-inner">
        {/* 상단바 (알림 포함) */}
        <TopBar
          onMenuClick={() => {
            setShowAlertDropdown(false);
            setMenuOpen((prev) => !prev);
          }}
          onProfileClick={() => navigate("/myPage")}
          notificationCount={totalNotificationCount}
          onClickNotification={() => {
            if (!user) {
              alert("로그인 후 일정/친구 알림을 확인할 수 있습니다.");
              return;
            }
            setMenuOpen(false);
            setShowAlertDropdown((prev) => !prev);
          }}
        />

        {/* 상단 우측 드롭다운 메뉴 */}
        {user && menuOpen && (
          <div className="topbar-menu-dropdown">
            {user?.userType === "ADMIN" && (
              <button
                className="topbar-menu-item"
                onClick={() => {
                  setMenuOpen(false);
                  navigate("/admin/users");
                }}
              >
                회원관리
              </button>
            )}
            <button
              className="topbar-menu-item"
              onClick={() => {
                setMenuOpen(false);
                navigate("/myPage");
              }}
            >
              마이페이지
            </button>
            <button
              className="topbar-menu-item"
              onClick={() => {
                setMenuOpen(false);
                handleLogout();
              }}
            >
              로그아웃
            </button>
          </div>
        )}

        {/* 일정 + 친구 알림 드롭다운 */}
        {showAlertDropdown && (
          <div className="alert-dropdown">
            {/* 1) 7일 이내 마감 일정 */}
            <div className="alert-section">
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
                          ? todo.promiseDate
                              .substring(5, 10)
                              .replace("-", "/")
                          : ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* 2) 친구 요청 */}
            <div className="alert-section">
              <div className="alert-dropdown-header">친구 요청</div>

              {friendRequests.length === 0 ? (
                <div className="alert-dropdown-empty">
                  새로운 친구 요청이 없습니다.
                </div>
              ) : (
                <ul className="alert-dropdown-list">
                  {friendRequests.map((req) => (
                  <li
                    key={req.requestId || req.id}
                    className="alert-dropdown-item friend-request-item"
                  >
                    <div className="friend-request-info">
                      <span className="friend-request-name">
                        {getFriendRequestName(req)}
                      </span>
                      <span className="friend-request-text">
                        친구 요청을 보냈습니다.
                      </span>
                    </div>
                    <div className="friend-request-actions">
                      <button
                        type="button"
                        className="friend-request-btn accept"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcceptFriendRequest(req.requestId);
                        }}
                      >
                        수락
                      </button>
                      <button
                        type="button"
                        className="friend-request-btn reject"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRejectFriendRequest(req.requestId);
                        }}
                      >
                        거절
                      </button>
                    </div>
                  </li>
                ))}

                </ul>
              )}
            </div>
          </div>
        )}

        {/* 메인 대시보드 */}
        <div className={`dashboard-new ${!user ? "locked" : ""}`}>
          <div className="main-grid">
            {/* 1️⃣ 검색창 */}
            <div className="search-wide">
              <WebSearch disabled={!user} />
            </div>

            {/* 2️⃣ 캘린더 */}
            <div className="calendar-area">
              <TimeHome
                disabled={!user}
                user={user}
                calendarRef={calendarRef}
                reloadKey={todoReloadKey}
                onTodosChange={() => setTodoReloadKey((prev) => prev + 1)}
                onDateSelected={(dateMoment) => setSelectedDate(dateMoment)}
              />
            </div>

            {/* 3️⃣ 오른쪽 상단 (프로필 + Todo + 날씨) */}
            <div className="right-top-area">
              <div className="profile-area">
                {user ? (
                  <UserInfo user={user} onLogout={handleLogout} />
                ) : (
                  <RightAuthBox />
                )}
              </div>

              <div className="todo-area">
                <TodoPanel
                  user={user}
                  reloadKey={todoReloadKey}
                  onAddTodo={() => {
                    calendarRef.current?.openAddTodo();
                  }}
                  // ✅ 일정 완료/수정 시
                  onTodoUpdated={handleTodoUpdated}
                  // ✅ 일정 삭제 시
                  onTodoDeleted={handleTodoDeleted}
                />
              </div>

              <div className="weather-area">
                <WeatherBoard disabled={!user} />
              </div>
            </div>

            {/* 4️⃣ 타임뷰 */}
            <div className="timeview-area">
              <TimeViewPage
                user={user}
                reloadKey={todoReloadKey}
                selectedDateFromCalendar={selectedDate}
              />
            </div>

            {/* 5️⃣ 지도 */}
            <div className="right-bottom-area">
              <div className="map-area">
                <KakaoMapBox disabled={!user} />
              </div>
            </div>
          </div>
        </div>

        {/* 필요시 아래 BoardHome 배치 가능 */}
        {/* <BoardHome /> */}
      </div>
    </div>
  );
};

export default MainPage;
