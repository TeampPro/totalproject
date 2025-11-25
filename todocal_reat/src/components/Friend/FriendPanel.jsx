import { useEffect, useState } from "react";
import {
  fetchFriends,
  fetchFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
} from "../../api/friendApi.js\
";

export default function FriendPanel() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchId, setSearchId] = useState("");

  // 로그인 정보
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = user?.id; // 필요하면 user.loginId 로 변경

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

  const handleSendRequest = async () => {
    if (!searchId.trim()) return;
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }
    try {
      await sendFriendRequest(myId, searchId.trim());
      alert("친구 요청을 보냈습니다.");
      setSearchId("");
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

      {/* 친구 찾기 / 친구 요청 보내기 */}
      <div>
        <input
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          placeholder="친구 아이디 입력"
        />
        <button onClick={handleSendRequest}>친구 요청</button>
      </div>

      {/* 받은 친구 요청 목록 */}
      <h3>받은 친구 요청</h3>
      {requests.length === 0 ? (
        <p>받은 요청이 없습니다.</p>
      ) : (
        requests.map((r) => (
          <div key={r.requestId}>
            {/* 보내는 사람 정보: 닉네임 → 이름 → 아이디 우선순위로 표시 */}
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
