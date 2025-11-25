import { useEffect, useState } from "react";
import { fetchFriends, fetchFriendRequests, sendFriendRequest, acceptFriendRequest, rejectFriendRequest } from "../../api/friendApi";
import "../../styles/friend/FriendPage.css";

export default function FriendPage() {
  const [friends, setFriends] = useState([]);
  const [requests, setRequests] = useState([]);
  const [searchId, setSearchId] = useState("");

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const myId = user?.id; // 필요하면 loginId 등으로 변경

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
      console.error("친구 데이터 로딩 실패:", e);
      alert("친구 정보를 불러오는 중 오류가 발생했습니다.");
    }
  };

  const handleSendRequest = async () => {
    const targetId = searchId.trim();
    if (!targetId) return;
    if (!myId) {
      alert("로그인이 필요합니다.");
      return;
    }

    try {
      await sendFriendRequest(myId, targetId);
      alert("친구 요청을 보냈습니다.");
      setSearchId("");
      await loadData();
    } catch (e) {
      console.error("친구 요청 실패:", e);
      alert("친구 요청 중 오류가 발생했습니다.");
    }
  };

  const handleAccept = async (requestId) => {
    if (!requestId) return;
    try {
      await acceptFriendRequest(requestId, myId);
      await loadData();
    } catch (e) {
      console.error("친구 요청 수락 실패:", e);
      alert("친구 요청 수락 중 오류가 발생했습니다.");
    }
  };

  const handleReject = async (requestId) => {
    if (!requestId) return;
    try {
      await rejectFriendRequest(requestId, myId);
      await loadData();
    } catch (e) {
      console.error("친구 요청 거절 실패:", e);
      alert("친구 요청 거절 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="friend-page">
      <div className="friend-page__inner">
        <header className="friend-header">
          <h2>👥 친구 관리</h2>
          <p className="friend-header__login">
            현재 로그인:{" "}
            <strong>
              {user?.nickname || user?.name || myId} ({myId})
            </strong>
          </p>
        </header>

        {/* 친구 추가 영역 */}
        <section className="friend-add">
          <label className="friend-add__label">친구 추가</label>
          <div className="friend-add__row">
            <input
              className="friend-input"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
              placeholder="상대방 아이디 입력"
            />
            <button className="friend-button friend-button--primary" onClick={handleSendRequest}>
              친구 요청 보내기
            </button>
          </div>
        </section>

        {/* 왼쪽: 친구 목록 / 오른쪽: 친구 요청 */}
        <section className="friend-columns">
          <div className="friend-card">
            <h3 className="friend-card__title">내 친구 목록</h3>
            {friends.length === 0 ? (
              <p className="friend-card__empty">아직 등록된 친구가 없습니다.</p>
            ) : (
              <ul className="friend-list">
                {friends.map((f) => (
                  <li key={f.id} className="friend-list__item">
                    <span className="friend-list__name">
                      {f.nickname || f.name || f.id}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="friend-card">
            <h3 className="friend-card__title">받은 친구 요청</h3>
            {requests.length === 0 ? (
              <p className="friend-card__empty">받은 요청이 없습니다.</p>
            ) : (
              <ul className="friend-list">
                {requests.map((r) => (
                  <li key={r.requestId} className="friend-list__item friend-list__item--request">
                    <div className="friend-request__info">
                      <span className="friend-list__name">
                        {r.fromNickname || r.fromName || r.fromId}
                      </span>
                      <span className="friend-request__id">요청 ID: {r.requestId}</span>
                    </div>
                    <div className="friend-request__buttons">
                      <button
                        className="friend-button friend-button--primary"
                        onClick={() => handleAccept(r.requestId)}
                      >
                        수락
                      </button>
                      <button
                        className="friend-button friend-button--danger"
                        onClick={() => handleReject(r.requestId)}
                      >
                        거절
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
