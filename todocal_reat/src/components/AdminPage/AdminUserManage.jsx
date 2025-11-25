import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminUserManage.css";

const FILTER_OPTIONS = [
  { value: "role", label: "직책" },
  { value: "name", label: "이름" },
  { value: "nickname", label: "닉네임" },
];

// 이름 텍스트 뽑기
const getUserName = (u) =>
  (u.name ??
    u.userName ??
    u.username ??
    u.userNm ??
    u.id ?? // 이름이 없으면 id라도
    "") + "";

// 닉네임 텍스트 뽑기 (백엔드에 nickname 없으면 그냥 빈 문자열)
const getUserNickname = (u) =>
  (u.nickname ?? u.nickName ?? u.nick ?? "") + "";

// 직책 텍스트 (userType 기준)
const getRoleText = (u) => {
  if (u.userType === "ADMIN") return "관리자";
  if (u.userType === "KAKAO") return "카카오";
  return "일반회원"; // NORMAL, GUEST 등
};

function AdminUserManage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filterType, setFilterType] = useState("name");
  const [keyword, setKeyword] = useState("");

  // 정렬 상태
  const [sortConfig, setSortConfig] = useState({
    key: "number", // number | name | id | nickname | activity
    direction: "asc", // asc | desc
  });

  // 관리자 체크
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem("user"));
    if (!stored || stored.userType !== "ADMIN") {
      alert("관리자만 접근 가능합니다.");
      navigate("/");
    }
  }, [navigate]);

  // 전체 회원 조회
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("http://localhost:8080/api/admin/users");
        setUsers(res.data || []);
        console.log("👤 관리자 회원 목록:", res.data);
      } catch (err) {
        console.error("❌ 회원 목록 불러오기 실패:", err);
      }
    };
    fetchUsers();
  }, []);

  // 헤더 클릭 시 정렬 변경
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return {
          key,
          direction: prev.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // 검색 + 정렬
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    let base = users;

    if (q) {
      base = users.filter((u) => {
        const nameText = getUserName(u).toLowerCase();
        const nickText = getUserNickname(u).toLowerCase();
        const roleText = getRoleText(u).toLowerCase();

        if (filterType === "role") {
          return roleText.includes(q);
        }
        if (filterType === "name") {
          return nameText.includes(q);
        }
        if (filterType === "nickname") {
          return nickText.includes(q);
        }
        return false;
      });
    }

    const arr = [...base];

    if (!sortConfig) return arr;

    arr.sort((a, b) => {
      let result = 0;

      switch (sortConfig.key) {
        case "number": {
          const idxA = users.indexOf(a);
          const idxB = users.indexOf(b);
          result = idxA - idxB;
          break;
        }
        case "name": {
          const nameA = getUserName(a);
          const nameB = getUserName(b);
          result = nameA.localeCompare(nameB, "ko");
          break;
        }
        case "id": {
          const idA = (a.id || "").toString();
          const idB = (b.id || "").toString();
          result = idA.localeCompare(idB, "ko");
          break;
        }
        case "nickname": {
          const nA = getUserNickname(a);
          const nB = getUserNickname(b);
          result = nA.localeCompare(nB, "ko");
          break;
        }
        case "activity": {
          const cA = a.activityCount ?? 0;
          const cB = b.activityCount ?? 0;
          result = cA - cB;
          break;
        }
        default:
          result = 0;
      }

      return sortConfig.direction === "asc" ? result : -result;
    });

    return arr;
  }, [users, filterType, keyword, sortConfig]);

  // 회원 정보 페이지로 이동
  const handleGoUserInfo = (user) => {
    if (!user || !user.id) return;
    navigate(`/admin/users/${encodeURIComponent(user.id)}/info`, {
      state: { user },
    });
  };

  // 회원 활동(일정) 페이지로 이동
  const handleGoActivity = (user) => {
    if (!user || !user.id) return;
    navigate(`/admin/users/${encodeURIComponent(user.id)}/tasks`);
  };

  // 회원 탈퇴
  const handleDeleteUser = async (userId) => {
    if (!window.confirm("정말 이 회원을 탈퇴 처리하시겠습니까?")) return;
    try {
      await axios.delete(
        `http://localhost:8080/api/admin/users/${encodeURIComponent(userId)}`
      );
      alert("회원이 탈퇴 처리되었습니다.");
      setUsers((prev) => prev.filter((u) => u.id !== userId));
    } catch (err) {
      console.error("❌ 회원 탈퇴 실패:", err);
      alert("회원 탈퇴 처리 중 오류가 발생했습니다.");
    }
  };

  // 검색 버튼
  const handleSearchClick = () => {
    setKeyword((prev) => prev.trim());
  };

  return (
    <div className="admin-user-page">
      {/* 제목 영역 */}
      <header className="admin-user-header">
        <h1>회원 관리</h1>
      </header>

      {/* 검색 영역 */}
      <section className="admin-user-search">
        <div className="search-filter-box">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* 검색 input + 버튼 */}
        <div className="search-input-box">
          <input
            type="text"
            placeholder="검색어를 입력하세요"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSearchClick();
            }}
          />
          <button className="search-button" onClick={handleSearchClick}>
            검색
          </button>
        </div>
      </section>

      {/* 회원 목록 영역 */}
      <section className="admin-user-list-section">
        <div className="admin-user-list-header">
          <div
            className="col-number sortable"
            onClick={() => handleSort("number")}
          >
            번호{" "}
            {sortConfig.key === "number" &&
              (sortConfig.direction === "asc" ? "▲" : "▼")}
          </div>
          <div
            className="col-name sortable"
            onClick={() => handleSort("name")}
          >
            이름{" "}
            {sortConfig.key === "name" &&
              (sortConfig.direction === "asc" ? "▲" : "▼")}
          </div>
          <div
            className="col-userid sortable"
            onClick={() => handleSort("id")}
          >
            아이디{" "}
            {sortConfig.key === "id" &&
              (sortConfig.direction === "asc" ? "▲" : "▼")}
          </div>
          <div
            className="col-nickname sortable"
            onClick={() => handleSort("nickname")}
          >
            닉네임{" "}
            {sortConfig.key === "nickname" &&
              (sortConfig.direction === "asc" ? "▲" : "▼")}
          </div>
          <div
            className="col-activity sortable"
            onClick={() => handleSort("activity")}
          >
            활동내역(숫자){" "}
            {sortConfig.key === "activity" &&
              (sortConfig.direction === "asc" ? "▲" : "▼")}
          </div>
          <div className="col-buttons" />
          <div className="col-delete">회원탈퇴</div>
        </div>

        <div className="admin-user-list-body">
          {filtered.length === 0 && (
            <div className="admin-user-empty">회원이 없습니다.</div>
          )}

          {filtered.map((user, index) => {
            const displayName = getUserName(user);
            const displayNickname = getUserNickname(user);
            const userIdText = user.id || "-";

            return (
              <div className="admin-user-row" key={user.id || index}>
                <div className="col-number">{index + 1}</div>
                <div className="col-name">{displayName || "-"}</div>
                <div className="col-userid">{userIdText}</div>
                <div className="col-nickname">{displayNickname || "-"}</div>
                <div className="col-activity">
                  {user.activityCount ?? 0}
                </div>

                <div className="col-buttons">
                  <button
                    className="circle-btn"
                    title="회원 정보"
                    onClick={() => handleGoUserInfo(user)}
                  >
                    정보
                  </button>
                  <button
                    className="circle-btn"
                    title="활동 내역"
                    onClick={() => handleGoActivity(user)}
                  >
                    활동
                  </button>
                </div>

                <div className="col-delete">
                  <button
                    className="delete-btn"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    회원탈퇴
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default AdminUserManage;
