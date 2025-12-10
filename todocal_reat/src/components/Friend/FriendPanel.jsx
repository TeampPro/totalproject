import { useEffect, useState } from "react";
import {
  fetchFriends,
  fetchFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  searchUsers, // ✅ 추가
} from "../../api/friendApi.js";

export default function FriendPanel() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);

  const [keyword, setKeyword] = useState("");        // ✅ 아이디 또는 닉네임
  const [searchResults, setSearchResults] = useState([]); // ✅ 검색 결과 리스트

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = user?.id;

  useEffect(() => {
    if (!myId) return;
    loadData();
  }, [myId]);

  const loadData = async () => {
    try {
      const [f, r] = await Promise.all([
        fetchFriends(myId),
        fetchFriendRequests(myId),
      ]);
      setFriends(f);
      setRequests(r);
    } catch (e) {
      console.error("친구/요청 조회 실패:", e);
      alert("친구 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  // ✅ 아이디 / 닉네임으로 유저 검색
  const handleSearch = async () => {
    if (!keyword.trim()) {
      alert("아이디 또는 닉네임을 입력해주세요.");
      return;
    }
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      const users = await searchUsers(keyword.trim());
      setSearchResults(users);
      if (users.length === 0) {
        alert("검색 결과가 없습니다.");
      }
    } catch (e) {
      console.error("유저 검색 실패:", e);
      alert("유저 검색 중 오류가 발생했습니다.");
    }
  };

  // ✅ 선택된 유저에게 친구 요청 보내기
  const handleSendRequest = async (targetId) => {
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await sendFriendRequest(myId, targetId);
      alert("친구 요청을 보냈습니다.");
      await loadData();
    } catch (e) {
      console.error("친구 요청 실패:", e);
      alert("친구 요청 중 오류가 발생했습니다.");
    }
  };

  const handleAccept = async (requestId) => {
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await acceptFriendRequest(requestId, myId);
      await loadData();
    } catch (e) {
      console.error("친구 요청 수락 실패:", e);
      alert("친구 요청 수락 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (requestId) => {
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await rejectFriendRequest(requestId, myId);
      await loadData();
    } catch (e) {
      console.error("친구 요청 거절 실패:", e);
      alert("친구 요청 거절 중 오류가 발생했습니다.");
    }
  };

  return (
    <div>
      <h2>친구</h2>

      {/* 🔹 친구 찾기 (아이디 or 닉네임) */}
      <div>
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="아이디 또는 닉네임 입력"
        />
        <button onClick={handleSearch}>검색</button>
      </div>

      {/* 🔹 검색 결과 목록 + 친구 요청 버튼 */}
      {searchResults.length > 0 && (
        <div>
          <h3>검색 결과</h3>
          {searchResults.map((u) => (
            <div key={u.id} style={{ marginBottom: "4px" }}>
              {/* 닉네임(있으면) + 아이디 같이 보여주기 */}
              <span>
                {u.nickname ? `${u.nickname} (${u.id})` : u.id}
              </span>
              <button
                style={{ marginLeft: "8px" }}
                onClick={() => handleSendRequest(u.id)}
              >
                친구 요청
              </button>
            </div>
          ))}
        </div>
      )}

      {/* 받은 친구 요청 목록 */}
      <h3>받은 친구 요청</h3>
      {requests.length === 0 ? (
        <p>받은 요청이 없습니다.</p>
      ) : (
        requests.map((r) => (
          <div key={r.requestId}>
            {r.fromNickname || r.fromName || r.fromId}
            <button onClick={() => handleAccept(r.requestId)}>수락</button>
            <button onClick={() => handleReject(r.requestId)}>거절</button>
          </div>
        ))
      )}

      {/* 친구 목록 */}
      <h3>친구 목록</h3>
      {friends.length === 0 ? (
        <p>아직 친구가 없습니다.</p>
      ) : (
        friends.map((f) => (
          <div key={f.id}>
            {f.nickname || f.name || f.id}
          </div>
        ))
      )}
    </div>
  );
}
