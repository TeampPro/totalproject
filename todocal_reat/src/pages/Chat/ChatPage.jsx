// src/pages/Chat/ChatPage.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {
  fetchFriends,
  deleteFriend, // 친구 삭제
} from "../../api/friendApi";

import "../../styles/Chat/ChatPage.css";

// 🔹 이미지 (src/assets)
import talk from "../../assets/talk.svg"; // TALK! 텍스트 로고
import Group from "../../assets/Group.svg"; // 친구추가 아이콘
import add_comment from "../../assets/add_comment.svg"; // 새 대화방
import logo from "../../assets/logo.svg"; // ;P 아이콘

import Vector from "../../assets/Vector.svg"; // 연필 아이콘
import backspace from "../../assets/backspace.svg"; // X 아이콘
import people from "../../assets/people.svg"; // 사람 아이콘
import west from "../../assets/west.svg"; // 뒤로가기

import profileBig from "../../assets/profileBig.svg"; // 프로필 아이콘 (큰 원)
import format_list from "../../assets/format_list.svg"; // 검색창 왼쪽 줄3개
import searchLogo from "../../assets/searchLogo.svg"; // 검색창 돋보기

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);

  // 검색 키워드
  const [roomKeyword, setRoomKeyword] = useState("");
  const [friendKeyword, setFriendKeyword] = useState("");

   // 🔹 그룹 대화 모드 & 선택된 친구들
  const [groupMode, setGroupMode] = useState(false);
  const [selectedGroupFriendIds, setSelectedGroupFriendIds] = useState([]);

  const navigate = useNavigate();

  // 로그인 사용자
  const loginUser = JSON.parse(localStorage.getItem("user") || "null");

  // 채팅에서 사용할 닉네임 계산
  const getMemberName = () => {
    // 1) 회원 / 관리자
    if (loginUser && loginUser.userType !== "GUEST") {
      const nick = loginUser.nickname || loginUser.name || loginUser.id;
      localStorage.setItem("memberName", nick);
      return nick;
    }

    // 2) 비회원 로그인(GUEST)
    if (loginUser && loginUser.userType === "GUEST") {
      const stored = localStorage.getItem("memberName");
      const guestNick =
        stored ||
        loginUser.nickname ||
        loginUser.name ||
        loginUser.id ||
        `guest_${Math.random().toString(36).substring(2, 8)}`;

      localStorage.setItem("memberName", guestNick);
      return guestNick;
    }

    // 3) 비로그인 / 기타
    const fromStorage = localStorage.getItem("memberName");
    if (fromStorage) return fromStorage;

    const fallback = "GUEST";
    localStorage.setItem("memberName", fallback);
    return fallback;
  };

  // 채팅방 목록 불러오기
  useEffect(() => {
    const memberName = getMemberName();

    const fetchRooms = async () => {
      try {
        const res = await axios.get("/api/chat/rooms", {
          params: { memberName },
        });
        setRooms(res.data || []);
      } catch (err) {
        console.error("❌ 채팅방 목록 조회 오류:", err);
        alert("채팅방 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingRooms(false);
      }
    };

    fetchRooms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 친구 목록 불러오기
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const myId = user?.id;
    if (!myId) {
      setLoadingFriends(false);
      return;
    }

    const loadFriends = async () => {
      try {
        const f = await fetchFriends(myId);
        setFriends(f || []);
      } catch (e) {
        console.error("친구 목록 조회 실패:", e);
        alert("친구 목록을 불러오지 못했습니다.");
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, []);

  // 방 입장
  const handleEnterRoom = async (room) => {
    try {
      const memberName = getMemberName();
      localStorage.setItem("memberName", memberName);

      await axios.post(`/api/chat/rooms/${room.id}/join`, null, {
        params: { memberName },
      });

      navigate(`/chat/${room.id}`, {
        state: { memberName, roomName: room.name },
      });
    } catch (err) {
      console.error("❌ 채팅방 입장 오류:", err);
      alert("채팅방에 입장할 수 없습니다.");
    }
  };

  // 새 채팅방 생성
  const handleCreateRoom = async () => {
    try {
      const memberName = getMemberName();
      localStorage.setItem("memberName", memberName);

      const res = await axios.post("/api/chat/rooms", null, {
        params: { memberName },
      });

      if (res.data && res.data.id) {
        const createdRoom = res.data;
        setRooms((prev) => [...prev, createdRoom]);

        navigate(`/chat/${createdRoom.id}`, {
          state: { memberName, roomName: createdRoom.name },
        });
      } else {
        alert("채팅방 생성에 실패했습니다.");
      }
    } catch (err) {
      console.error("❌ 채팅방 생성 오류:", err);
      alert("채팅방 생성 중 문제가 발생했습니다.");
    }
  };

  // ✅ 특정 친구와 1:1 채팅방 생성
const handleCreateRoomWithFriend = async (friend) => {
  try {
    const memberName = getMemberName();
    localStorage.setItem("memberName", memberName);

    // 1) 방 생성 (본인은 서비스에서 자동 참여자로 넣는 구조)
    const res = await axios.post("/api/chat/rooms", null, {
      params: { memberName },
    });

    if (!res.data || !res.data.id) {
      alert("1:1 채팅방 생성에 실패했습니다.");
      return;
    }

    const createdRoom = { ...res.data };

    // 친구 쪽에서 사용하는 이름 (ChatPage의 memberName 기준과 같아야 함)
    const friendName = friend.nickname || friend.name || friend.id;
    const roomName = `${memberName} & ${friendName}`;

    // 2) 친구를 해당 방에 참여자로 추가
    try {
      await axios.post(
        `/api/chat/rooms/${createdRoom.id}/join`,
        null,
        { params: { memberName: friendName } }
      );
    } catch (e) {
      console.error("❌ 친구 방 참여 처리 오류:", e);
      // 참여 실패해도 방은 생성되므로 alert만 띄우고 계속 진행
      alert("친구를 방에 참여시키는 데 실패했습니다.");
    }

    // 3) 방 이름을 1:1 형태로 변경
    try {
      const renameRes = await axios.patch(
        `/api/chat/rooms/${createdRoom.id}/name`,
        { name: roomName }
      );
      createdRoom.name = renameRes.data?.name || roomName;
    } catch (e) {
      console.error("❌ 1:1 방 이름 변경 오류:", e);
      createdRoom.name = roomName;
    }

    // 4) 목록에 추가
    setRooms((prev) => [...prev, createdRoom]);

    // 5) 생성한 방으로 이동
    navigate(`/chat/${createdRoom.id}`, {
      state: { memberName, roomName: createdRoom.name },
    });
  } catch (err) {
    console.error("❌ 1:1 채팅방 생성 오류:", err);
    alert("1:1 채팅방을 생성하지 못했습니다.");
  }
};

  // 방 이름 변경
  const handleRenameRoom = async (e, room) => {
    e.stopPropagation();

    const newName = window.prompt("새 채팅방 이름을 입력하세요.", room.name || "");
    if (newName === null) return;

    const trimmed = newName.trim();
    if (!trimmed) {
      alert("이름은 비워둘 수 없습니다.");
      return;
    }

    try {
      const res = await axios.patch(`/api/chat/rooms/${room.id}/name`, {
        name: trimmed,
      });

      const updatedName = res.data?.name ?? trimmed;

      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, name: updatedName } : r))
      );
    } catch (err) {
      console.error("❌ 채팅방 이름 변경 오류:", err);
      alert("채팅방 이름 변경에 실패했습니다.");
    }
  };

  // 방 삭제 (UI에서는 '나가기')
  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();
    if (!window.confirm("이 채팅방에서 나가시겠습니까?")) return;

    try {
      await axios.delete(`/api/chat/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      console.error("❌ 채팅방 삭제 오류:", err);
      alert("채팅방 나가기 중 문제가 발생했습니다.");
    }
  };

  // 친구 삭제
  const handleDeleteFriend = async (friend) => {
    if (!loginUser?.id) {
      alert("로그인 정보가 없습니다.");
      return;
    }

    if (!window.confirm("이 친구를 삭제하시겠습니까?")) return;

    try {
      const myId = loginUser.id;
      const friendId = friend.friendId || friend.id;

      await deleteFriend(myId, friendId);

      setFriends((prev) =>
        prev.filter((f) => (f.friendId || f.id) !== friendId)
      );
    } catch (err) {
      console.error("❌ 친구 삭제 오류:", err);
      alert("친구 삭제 중 문제가 발생했습니다.");
    }
  };

  // 친구 관리 페이지로 이동
  const goFriendPage = () => {
    navigate("/friends");
  };

  if (loadingRooms) {
    return <p className="chat-loading">채팅방 목록 불러오는 중...</p>;
  }

    // 🔹 그룹 모드 토글 + 실행
  const handleGroupChatButtonClick = async () => {
    // 아직 그룹 모드가 아니면 -> 모드 켜고 선택 안내만
    if (!groupMode) {
      setGroupMode(true);
      setSelectedGroupFriendIds([]);
      alert("그룹 대화에 초대할 친구를 오른쪽 '친구 목록'에서 선택해주세요.");
      return;
    }

    // 그룹 모드인 상태에서 다시 버튼 클릭 -> 실제 그룹 방 생성 시도
    if (selectedGroupFriendIds.length === 0) {
      alert("그룹 대화에 추가할 친구를 한 명 이상 선택해주세요.");
      return;
    }

    try {
      const memberName = getMemberName();
      localStorage.setItem("memberName", memberName);

      const selectedFriends = friends.filter((f) =>
        selectedGroupFriendIds.includes(f.friendId || f.id)
      );

      if (selectedFriends.length === 0) {
        alert("선택된 친구 정보를 찾을 수 없습니다.");
        return;
      }
      
      // 1) 새 그룹 방 생성
      const resRoom = await axios.post("/api/chat/rooms", null, {
        params: { memberName },
      });

      if (!resRoom.data || !resRoom.data.id) {
        alert("그룹 채팅방 생성에 실패했습니다.");
        return;
      }

      const createdRoom = { ...resRoom.data };

      // 2) 친구들 참여자로 추가
      for (const f of selectedFriends) {
        const friendName = f.nickname || f.name || f.id;
        if (!friendName) continue;

        try {
          await axios.post(`/api/chat/rooms/${createdRoom.id}/join`, null, {
            params: { memberName: friendName },
          });
        } catch (e) {
          console.error("❌ 그룹 방 친구 참여 처리 오류:", e);
        }
      }

      // 3) 방 이름 설정 (나 + 몇 명)
      const title = `${memberName} 외 ${selectedFriends.length}명`;
      try {
        const renameRes = await axios.patch(
          `/api/chat/rooms/${createdRoom.id}/name`,
          { name: title }
        );
        createdRoom.name = renameRes.data?.name || title;
      } catch (e) {
        console.error("❌ 그룹 방 이름 변경 오류:", e);
        createdRoom.name = title;
      }

      // 4) 새 그룹 방 초대 링크 생성 + 복사
      try {
        const inviteRes = await axios.post(
          `/api/chat/rooms/${createdRoom.id}/invite`
        );
        const fullLink = window.location.origin + inviteRes.data;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(fullLink);
            alert(
              "그룹 채팅방이 생성되었습니다.\n그룹 대화방 초대 링크가 클립보드에 복사되었습니다."
            );
          } catch (copyErr) {
            console.error("그룹 초대 링크 복사 실패:", copyErr);
            alert(
              "그룹 채팅방이 생성되었습니다.\n(초대 링크 복사에 실패했습니다.)"
            );
          }
        } else {
          alert(
            "그룹 채팅방이 생성되었습니다.\n(브라우저에서 클립보드 복사를 지원하지 않습니다.)"
          );
        }
      } catch (inviteErr) {
        console.error("그룹 초대 링크 생성 실패:", inviteErr);
        alert(
          "그룹 채팅방이 생성되었습니다.\n(초대 링크 생성에 실패했습니다.)"
        );
      }

      // 5) 방 목록에 추가 + 그룹 모드 해제
      setRooms((prev) => [...prev, createdRoom]);
      setGroupMode(false);
      setSelectedGroupFriendIds([]);

      // 6) 새 그룹 방으로 이동
      navigate(`/chat/${createdRoom.id}`, {
        state: { memberName, roomName: createdRoom.name },
      });
    } catch (err) {
      console.error("❌ 그룹 채팅방 생성 오류:", err);
      alert("그룹 채팅방을 생성하지 못했습니다.");
    }
  };
  
  // 🔹 그룹 모드에서 친구 선택 토글
  const toggleSelectGroupFriend = (friendId) => {
    setSelectedGroupFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };


  // 검색 반영된 목록
  const filteredRooms = rooms.filter((room) =>
    (room.name || "").toLowerCase().includes(roomKeyword.trim().toLowerCase())
  );

  const filteredFriends = friends.filter((f) => {
    const keyword = friendKeyword.trim().toLowerCase();
    if (!keyword) return true;

    const nameStr =
      (f.nickname || f.name || f.id || "").toString().toLowerCase();

    return nameStr.includes(keyword);
  });

  return (
    <div className="chat-page">
      {/* 상단 로고/타이틀 영역 */}
      <header className="chat-page__header">
        <button className="chat-page__back-btn" onClick={() => navigate(-1)}>
          <img src={west} alt="뒤로가기" className="chat-page__back-icon" />
        </button>

        <div className="chat-page__logo-box">
          <div className="chat-page__logo-wrap">
            <img src={logo} alt=";P 로고" className="chat-page__logo-icon" />
            <img
              src={talk}
              alt="TALK!"
              className="chat-page__logo-text-img"
            />
          </div>

          <p className="chat-page__subtitle">
            친구와 채팅으로 일정을 이야기해보세요 !
          </p>
        </div>
      </header>

      {/* 본문: 좌 대화방, 우 친구 목록 */}
      <main className="chat-page__body">
        {/* 대화방 목록 영역 */}
        <section className="chat-panel chat-panel--rooms">
                    <div className="chat-panel__header">
            <h3 className="chat-panel__title">대화방 목록</h3>

            <div style={{ display: "flex", gap: "8px" }}>
              <button
                className="chat-panel__primary-btn"
                onClick={handleCreateRoom}
              >
                <img
                  src={add_comment}
                  alt="새 대화방"
                  className="chat-btn-icon"
                />
                <span>새 대화방</span>
              </button>

              {/* 🔹 새로 추가된 그룹 대화 만들기 버튼 */}
              <button
                className="chat-panel__primary-btn chat-panel__primary-btn--secondary"
                onClick={handleGroupChatButtonClick}
              >
                <img
                  src={add_comment}
                  alt="그룹 대화 만들기"
                  className="chat-btn-icon"
                />
                <span>
                  {groupMode ? "선택한 친구들과 그룹 대화" : "그룹 대화 만들기"}
                </span>
              </button>
            </div>
          </div>


          {/* 대화방 검색바 */}
          <div className="chat-search chat-search--room">
            <div className="chat-search__inner">
              <img
                src={format_list}
                alt="리스트"
                className="chat-search__icon-left chat-search__icon-left--room"
              />
              <input
                className="chat-search__input chat-search__input--room"
                type="text"
                placeholder="찾으실 대화방 이름을 검색하세요."
                value={roomKeyword}
                onChange={(e) => setRoomKeyword(e.target.value)}
              />
              <img
                src={searchLogo}
                alt="검색"
                className="chat-search__icon-right chat-search__icon-right--room"
              />
            </div>
          </div>

          <div className="chat-room-list">
            {filteredRooms.length === 0 ? (
              <p className="chat-empty-text">참여 중인 채팅방이 없습니다.</p>
            ) : (
              filteredRooms.map((room) => (
                <div key={room.id} className="chat-room-item">
                  {/* 박스 밖 상단 우측: 이름 변경 / 나가기 */}
                  <div className="chat-room-actions">
                    <button
                      className="chat-room-link-btn"
                      onClick={(e) => handleRenameRoom(e, room)}
                    >
                      <span>이름 변경</span>
                      <img
                        src={Vector}
                        alt="이름 변경"
                        className="chat-room-action-icon"
                      />
                    </button>
                    <button
                      className="chat-room-link-btn chat-room-link-btn--danger"
                      onClick={(e) => handleDeleteRoom(e, room.id)}
                    >
                      <span>나가기</span>
                      <img
                        src={backspace}
                        alt="나가기"
                        className="chat-room-action-icon"
                      />
                    </button>
                  </div>

                  {/* 아래 파란 박스: 대화방 카드 */}
                  <div
                    className="chat-room-card"
                    onClick={() => handleEnterRoom(room)}
                  >
                    <div className="chat-room-card__left">
                      <div className="chat-room-avatar">
                        <img
                          src={profileBig}
                          alt="방 프로필"
                          className="chat-room-avatar-img"
                        />
                      </div>
                      <div className="chat-room-texts">
                        <div className="chat-room-name">{room.name}</div>
                      </div>
                    </div>

                    <div className="chat-room-participants">
                      <img
                        src={people}
                        alt="참여자"
                        className="chat-room-participants-icon"
                      />
                      <span>{room.participantCount ?? 0}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {/* 친구 목록 영역 */}
        <section className="chat-panel chat-panel--friends">
          <div className="chat-panel__header">
            <h3 className="chat-panel__title">친구 목록</h3>

            <button
              className="chat-panel__primary-btn chat-panel__primary-btn--small"
              onClick={goFriendPage}
            >
              <img src={Group} alt="친구추가" className="chat-btn-icon" />
              <span>친구추가</span>
            </button>
          </div>

          {/* 친구 검색바 */}
          <div className="chat-search chat-search--friend">
            <div className="chat-search__inner chat-search__inner--friend">
              <img
                src={format_list}
                alt="리스트"
                className="chat-search__icon-left chat-search__icon-left--friend"
              />
              <input
                className="chat-search__input chat-search__input--friend"
                type="text"
                placeholder="찾으실 친구의 이름을 검색하세요."
                value={friendKeyword}
                onChange={(e) => setFriendKeyword(e.target.value)}
              />
              <img
                src={searchLogo}
                alt="검색"
                className="chat-search__icon-right chat-search__icon-right--friend"
              />
            </div>
          </div>

                    <div className="chat-friend-list">
            {loadingFriends ? (
              <p className="chat-empty-text">친구 목록 불러오는 중...</p>
            ) : filteredFriends.length === 0 ? (
              <p className="chat-empty-text">등록된 친구가 없습니다.</p>
            ) : (
              filteredFriends.map((f) => {
                const friendId = f.friendId || f.id;
                const isSelectedForGroup =
                  selectedGroupFriendIds.includes(friendId);

                return (
                  <div
                    key={friendId}
                    className={
                      "chat-friend-item" +
                      (isSelectedForGroup ? " chat-friend-item--selected" : "")
                    }
                    onClick={() => {
                      if (groupMode && friendId) {
                        toggleSelectGroupFriend(friendId);
                      }
                    }}
                  >
                    {/* 카드 밖 상단 우측: 1:1 채팅 / 친구 삭제 */}
                    <div className="chat-friend-actions">
                      <button
                        className="chat-friend-chat-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCreateRoomWithFriend(f);
                        }}
                      >
                        1:1 채팅
                      </button>
                      <button
                        className="chat-friend-delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFriend(f);
                        }}
                      >
                        친구 삭제
                      </button>
                    </div>

                    {/* 친구 카드 */}
                    <div className="chat-friend-card">
                      <div className="chat-friend-avatar">
                        <img
                          src={profileBig}
                          alt="친구 프로필"
                          className="chat-friend-avatar-img"
                        />
                      </div>
                      <div className="chat-friend-texts">
                        <div className="chat-friend-name">
                          {f.nickname || f.name || f.id}
                        </div>
                        <div className="chat-friend-status">친구</div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

        </section>
      </main>
    </div>
  );
}
