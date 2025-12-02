import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";
import { fetchFriends } from "../../api/friendApi";

import profileBig from "../../assets/profileBig.svg";
import peopleIcon from "../../assets/people.svg";
import searchIcon from "../../assets/search.svg";
import menuIcon from "../../assets/menu.svg";
import smallLogo from "../../assets/smalllogo.svg"; // 말풍선 아바타용
import smallProfile from "../../assets/smallprofil.svg"; // 참여자 목록 기본 프로필
import closeIcon from "../../assets/close.svg";

import "../../styles/Chat/ChatRoom.css";

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  const loginUser = JSON.parse(localStorage.getItem("user") || "null");

  const initialRoomName = location.state?.roomName || "";
  const [roomName, setRoomName] = useState(initialRoomName);

  const [memberName, setMemberName] = useState("");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  useEffect(() => {
    const state = location.state;
    if (state && Array.isArray(state.initialMembers) && state.initialMembers.length > 0) {
      setMembers(state.initialMembers);
    }
  }, [location.state]);

  const [msg, setMsg] = useState("");
  const [searchText, setSearchText] = useState("");

  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);

  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState([]);

  const ws = useRef(null);
  const nickname = useRef("");
  const reconnectTimer = useRef(null);
  const messagesEndRef = useRef(null);

  const chatBoxRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!chatBoxRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatBoxRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isBottom);
  };

  useEffect(() => {
    if (loginUser && loginUser.userType !== "GUEST") {
      const nick = loginUser.nickname || loginUser.name || loginUser.id;
      nickname.current = nick;
      setMemberName(nick);
      return;
    }

    if (loginUser && loginUser.userType === "GUEST") {
      let guestNick =
        loginUser.nickname ||
        loginUser.name ||
        loginUser.id ||
        `guest_${Math.random().toString(36).substring(2, 8)}`;

      nickname.current = guestNick;
      setMemberName(guestNick);
      return;
    }

    const invitedName = location.state?.memberName;
    if (invitedName) {
      nickname.current = invitedName;
      localStorage.setItem("memberName", invitedName);
      setMemberName(invitedName);
      return;
    }

    const storedGuestName = localStorage.getItem("memberName");
    if (storedGuestName) {
      nickname.current = storedGuestName;
      setMemberName(storedGuestName);
      return;
    }

    alert("닉네임 정보가 없습니다. 초대 링크로 입장해주세요.");
    navigate("/chat/invite");
  }, []);

    // ✅ 방 정보에서 참여자 목록을 한 번 더 가져와서 members에 반영
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomMembers = async () => {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}`);
        const data = res.data || {};

        // 백엔드에서 내려줄 수 있는 여러 필드 케이스 고려
        let list = [];
        if (Array.isArray(data.members)) list = data.members;
        else if (Array.isArray(data.participants)) list = data.participants;
        else if (Array.isArray(data.participantList)) list = data.participantList;

        if (list.length === 0) return;

        // 기존 members와 합치기 (중복 제거)
        setMembers((prev) => {
          const merged = [...prev];

          const exists = new Set(
            merged.map((m) => {
              if (typeof m === "string") return m;
              return (
                m.id ||
                m.userId ||
                m.nickname ||
                m.name ||
                JSON.stringify(m)
              );
            })
          );

          list.forEach((m) => {
            const key =
              typeof m === "string"
                ? m
                : m.id ||
                  m.userId ||
                  m.nickname ||
                  m.name ||
                  JSON.stringify(m);

            if (!exists.has(key)) {
              exists.add(key);
              merged.push(m);
            }
          });

          return merged;
        });
      } catch (err) {
        console.error("채팅방 참여자 정보 조회 실패:", err);
      }
    };

    fetchRoomMembers();
  }, [roomId]);

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;
    if (!roomId || !nickname.current) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/chat?roomId=${roomId}&memberName=${encodeURIComponent(
        nickname.current
      )}`
    );

    ws.current = socket;

    socket.onopen = () => {
      setIsConnected(true);
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

        socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      // ✅ members가 오면 "교체"가 아니라 기존 + 새 목록을 합쳐서 저장
      if (Array.isArray(data.members)) {
        setMembers((prev) => {
          const merged = [...prev];

          // 기존 멤버 키 세트
          const exists = new Set(
            merged.map((m) => {
              if (typeof m === "string") return m;
              return (
                m.id ||
                m.userId ||
                m.nickname ||
                m.name ||
                JSON.stringify(m)
              );
            })
          );

          // 새로 온 멤버를 기존에 없으면 추가
          data.members.forEach((m) => {
            const key =
              typeof m === "string"
                ? m
                : m.id ||
                  m.userId ||
                  m.nickname ||
                  m.name ||
                  JSON.stringify(m);

            if (!exists.has(key)) {
              exists.add(key);
              merged.push(m);
            }
          });

          return merged;
        });
        return;
      }

      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };


    socket.onerror = (err) => {
      console.error("⚠️ WebSocket 오류:", err);
    };

    socket.onclose = (e) => {
      setIsConnected(false);

      if (e.code === 1000) return;
      if (e.code === 1008) return;
      if (e.code === 1003) {
        alert(e.reason || "채팅방 입장 권한이 없습니다.");
        return;
      }

      reconnectTimer.current = setTimeout(() => connectWebSocket(), 2000);
    };
  };

  useEffect(() => {
    if (!memberName || !roomId) return;

    let cancelled = false;

    const joinAndConnect = async () => {
      try {
        await axios.post(`/api/chat/rooms/${roomId}/join`, null, {
          params: { memberName },
        });

        if (!cancelled) connectWebSocket();
      } catch (err) {
        console.error("❌ 채팅방 입장 실패:", err);
        if (!cancelled) alert("채팅방 입장 실패");
      }
    };

    joinAndConnect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close(1000, "COMPONENT_UNMOUNT");
        ws.current = null;
      }
    };
  }, [memberName, roomId]);

  useEffect(() => {
    const loadOldMessages = async () => {
      const data = await fetchMessages(roomId);
      setMessages(
        data.length > 0
          ? data
          : [{ sender: "SYSTEM", message: "아직 메시지가 없습니다.", time: "" }]
      );
    };
    if (roomId) loadOldMessages();
  }, [roomId]);

  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // 초대 모달 열릴 때 친구 목록 로드 (한 번만)
  useEffect(() => {
    const myId = loginUser?.id;
    if (!showModal || !myId || friends.length > 0 || loadingFriends) return;

    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        const list = await fetchFriends(myId);
        setFriends(Array.isArray(list) ? list : []);
      } catch (e) {
        console.error("친구 목록 조회 실패:", e);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, [showModal, loginUser, friends.length, loadingFriends]);

  const sendMessage = () => {
    if (!msg.trim()) return;

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      alert("서버와 연결이 끊어졌습니다.");
      return;
    }

    ws.current.send(
      JSON.stringify({
        type: "chat",
        sender: nickname.current,
        message: msg,
        roomId,
      })
    );

    setMsg("");
  };

  const createInvite = async () => {
    try {
      const res = await axios.post(`/api/chat/rooms/${roomId}/invite`);
      const fullLink = window.location.origin + res.data;
      setInviteLink(fullLink);
      setShowModal(true);
    } catch {
      alert("초대 링크 생성 실패");
    }
  };

  const copyLink = () => {
    if (!inviteLink) {
      alert("초대 링크가 없습니다.");
      return;
    }
    navigator.clipboard.writeText(inviteLink);
    alert("초대 링크가 복사되었습니다!");
  };

  const handleLeaveRoom = () => {
    navigate("/chat");
  };

  const handleChangeRoomName = () => {
    const newName = window.prompt(
      "새 대화방 이름을 입력해주세요.",
      roomName || ""
    );
    if (newName && newName.trim()) {
      setRoomName(newName.trim());
    }
  };

  // 1:1 대화 (이전 기능 유지) – 해당 친구와 1:1 방 + 초대 링크 복사
  const handleInviteFriendOneToOne = async (friend) => {
    try {
      if (!roomId) return;

      let link = inviteLink;
      if (!link) {
        const res = await axios.post(`/api/chat/rooms/${roomId}/invite`);
        link = window.location.origin + res.data;
        setInviteLink(link);
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(link);
        }
      } catch (e) {
        console.error("클립보드 복사 실패:", e);
      }

      const baseName =
        nickname.current ||
        memberName ||
        loginUser?.nickname ||
        loginUser?.name ||
        loginUser?.id;

      const friendName = friend.nickname || friend.name || friend.id;

      if (!baseName || !friendName) {
        alert("초대에 필요한 정보가 부족합니다.");
        return;
      }

      const resRoom = await axios.post("/api/chat/rooms", null, {
        params: { memberName: baseName },
      });

      if (!resRoom.data || !resRoom.data.id) {
        throw new Error("방 생성 실패");
      }

      const newRoom = resRoom.data;
      const title = `${baseName} & ${friendName}`;

      try {
        await axios.post(`/api/chat/rooms/${newRoom.id}/join`, null, {
          params: { memberName: friendName },
        });
      } catch (e) {
        console.error("친구 1:1 방 참여 실패:", e);
      }

      try {
        await axios.patch(`/api/chat/rooms/${newRoom.id}/name`, {
          name: title,
        });
      } catch (e) {
        console.error("1:1 방 이름 변경 실패:", e);
      }

      alert(
        `${friendName}님과의 1:1 채팅방으로 이동합니다.\n초대 링크가 복사되었으니 채팅창에 붙여넣어 보내주세요.`
      );

      setShowModal(false);

      navigate(`/chat/${newRoom.id}`, {
        state: { roomName: title, memberName: baseName },
      });
    } catch (e) {
      console.error("1:1 초대방 생성 실패:", e);
      alert("1:1 채팅방 생성 중 오류가 발생했습니다.");
    }
  };

  // 그룹 대화용 선택 토글
  const toggleSelectGroupFriend = (friend) => {
    const id = friend.id || friend.friendId;
    setSelectedGroupIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

    // 선택된 친구들과 그룹 채팅방 생성
  const handleCreateGroupChatFromModal = async () => {
    if (selectedGroupIds.length === 0) {
      alert("그룹 대화에 초대할 친구를 선택해주세요.");
      return;
    }

    try {
      const baseName =
        nickname.current ||
        memberName ||
        loginUser?.nickname ||
        loginUser?.name ||
        loginUser?.id;

      if (!baseName) {
        alert("로그인 정보를 확인해주세요.");
        return;
      }

      const selectedFriends = friends.filter((f) =>
        selectedGroupIds.includes(f.id || f.friendId)
      );

      if (selectedFriends.length === 0) {
        alert("선택된 친구 정보가 없습니다.");
        return;
      }

      // 1) 새 그룹 방 생성
      const resRoom = await axios.post("/api/chat/rooms", null, {
        params: { memberName: baseName },
      });

      if (!resRoom.data || !resRoom.data.id) {
        throw new Error("그룹 방 생성 실패");
      }

      const newRoom = resRoom.data;

      // 2) 친구들 참여자로 추가
      for (const f of selectedFriends) {
        const friendName = f.nickname || f.name || f.id;
        if (!friendName) continue;

        try {
          await axios.post(`/api/chat/rooms/${newRoom.id}/join`, null, {
            params: { memberName: friendName },
          });
        } catch (e) {
          console.error("그룹 대화 참여 처리 실패:", e);
        }
      }

      // 3) 방 이름 변경
      const title = `${baseName} 외 ${selectedFriends.length}명`;

      try {
        const renameRes = await axios.patch(`/api/chat/rooms/${newRoom.id}/name`, {
          name: title,
        });
        newRoom.name = renameRes.data?.name || title;
      } catch (e) {
        console.error("그룹 방 이름 변경 실패:", e);
        newRoom.name = title;
      }

      // 🔹 4) 우리가 알고 있는 참여자 목록 구성 (나 + 선택한 친구들)
      const initialMembers = [
        {
          id: loginUser?.id,
          nickname: baseName,
          name: baseName,
        },
        ...selectedFriends.map((f) => ({
          id: f.id || f.friendId,
          nickname: f.nickname || f.name || f.id,
          name: f.name || f.nickname || f.id,
        })),
      ];

      // 🔹 5) 새 그룹 방 초대 링크 생성 + 복사
      try {
        const inviteRes = await axios.post(`/api/chat/rooms/${newRoom.id}/invite`);
        const fullLink = window.location.origin + inviteRes.data;

        if (navigator.clipboard && navigator.clipboard.writeText) {
          try {
            await navigator.clipboard.writeText(fullLink);
            alert(
              "선택한 친구들과 그룹 대화를 시작합니다.\n그룹 대화방 초대 링크가 클립보드에 복사되었습니다."
            );
          } catch (copyErr) {
            console.error("그룹 초대 링크 복사 실패:", copyErr);
            alert(
              "선택한 친구들과 그룹 대화를 시작합니다.\n(초대 링크 복사에 실패했습니다.)"
            );
          }
        } else {
          alert(
            "선택한 친구들과 그룹 대화를 시작합니다.\n(브라우저에서 클립보드 복사를 지원하지 않습니다.)"
          );
        }
      } catch (inviteErr) {
        console.error("그룹 초대 링크 생성 실패:", inviteErr);
        alert(
          "선택한 친구들과 그룹 대화를 시작합니다.\n(초대 링크 생성에 실패했습니다.)"
        );
      }

      // 6) 모달 닫고 선택 초기화 후, 새 그룹 방으로 이동 (초기 멤버 함께 전달)
      setShowModal(false);
      setSelectedGroupIds([]);

      navigate(`/chat/${newRoom.id}`, {
        state: {
          roomName: newRoom.name,
          memberName: baseName,
          initialMembers, // 🔴 여기 추가
        },
      });
    } catch (e) {
      console.error("그룹 채팅방 생성 실패:", e);
      alert("그룹 채팅방 생성 중 오류가 발생했습니다.");
    }
  };


  const filteredMessages = messages.filter((m) => {
    if (!searchText.trim()) return true;
    if (m.systemMessage) return m.message.includes(searchText);
    return (
      m.message?.toLowerCase().includes(searchText.toLowerCase()) ||
      m.sender?.toLowerCase().includes(searchText.toLowerCase())
    );
  });

  const toggleMenu = () => {
    setMenuOpen((prev) => !prev);
    setShowMemberPanel(false);
  };

  const closeMenuPanels = () => {
    setMenuOpen(false);
    setShowMemberPanel(false);
  };

  return (
    <div className="chat-room">
      <div className="chat-card">
        {/* 헤더 */}
        <div className="chat-card-header">
          <div className="chat-header-left">
            <img
              src={profileBig}
              alt="room icon"
              className="chat-room-profile"
            />
            <div className="chat-header-text-block">
              <div className="chat-room-title">
                {roomName || `채팅방 (${roomId})`}
              </div>
              <div className="chat-room-member-inline">
                <img
                  src={peopleIcon}
                  alt="참여자"
                  className="chat-people-icon"
                />
                <span className="chat-member-count">{members.length}</span>
                <span className="chat-connection-dot">
                  {isConnected ? "● 연결됨" : "● 끊김"}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="chat-exit-btn"
            onClick={handleLeaveRoom}
          >
            대화방 나가기
          </button>
        </div>

        {/* 검색 + 메뉴 */}
        <div className="chat-search-row">
          <div className="chat-search-box">
            <img src={searchIcon} alt="검색" className="chat-search-icon" />
            <input
              type="text"
              className="chat-search-input"
              placeholder="찾으실 대화 내용을 검색하세요."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>

          <div className="chat-search-actions">
            <button
              type="button"
              className="chat-menu-btn"
              onClick={toggleMenu}
            >
              <img src={menuIcon} alt="메뉴" />
            </button>
          </div>
        </div>

        {/* 옵션 메뉴 패널 */}
        {menuOpen && !showMemberPanel && (
          <div className="chat-menu-panel">
            <div className="chat-menu-header">
              <button
                type="button"
                className="chat-menu-close-btn"
                onClick={closeMenuPanels}
              >
                <img src={closeIcon} alt="닫기" />
              </button>
              <button
                type="button"
                className="chat-menu-topicon-btn"
                onClick={closeMenuPanels}
              >
                <img src={menuIcon} alt="메뉴" />
              </button>
            </div>

            <button
              type="button"
              className="chat-menu-item"
              onClick={handleChangeRoomName}
            >
              대화방 제목 변경하기
            </button>

            <button
              type="button"
              className="chat-menu-item chat-menu-item-highlight"
              onClick={() => {
                createInvite();
                closeMenuPanels();
              }}
            >
              친구 초대하기
            </button>

            <button
              type="button"
              className="chat-menu-item"
              onClick={handleLeaveRoom}
            >
              대화방 나가기
            </button>

            <button
              type="button"
              className="chat-menu-item"
              onClick={() => setShowMemberPanel(true)}
            >
              참여자 목록
            </button>
          </div>
        )}

        {/* 참여자 목록 패널 */}
        {menuOpen && showMemberPanel && (
          <div className="chat-members-panel">
            <div className="chat-menu-header">
              <button
                type="button"
                className="chat-menu-close-btn"
                onClick={closeMenuPanels}
              >
                <img src={closeIcon} alt="닫기" />
              </button>
              <button
                type="button"
                className="chat-menu-topicon-btn"
                onClick={closeMenuPanels}
              >
                <img src={menuIcon} alt="메뉴" />
              </button>
            </div>

            <div className="chat-members-title">참여자 목록</div>

            <div className="chat-members-list-panel">
              {members.map((m, idx) => {
                const name =
                  typeof m === "string"
                    ? m
                    : m.nickname ||
                      m.name ||
                      m.id ||
                      m.username ||
                      "알 수 없는 사용자";

                const profileUrl =
                  typeof m === "object"
                    ? m.profileImageUrl ||
                      m.profileUrl ||
                      m.imageUrl ||
                      m.avatarUrl ||
                      null
                    : null;

                return (
                  <div key={idx} className="chat-member-row">
                    <div className="chat-member-avatar">
                      <img
                        src={profileUrl || smallProfile}
                        alt={name}
                        className="chat-member-avatar-img"
                      />
                    </div>
                    <span className="chat-member-name">{name}</span>
                  </div>
                );
              })}
              {members.length === 0 && (
                <div className="chat-members-empty">참여자가 없습니다.</div>
              )}
            </div>
          </div>
        )}

        {/* 메시지 리스트 */}
        <div
          className="chat-messages"
          ref={chatBoxRef}
          onScroll={handleScroll}
        >
          {filteredMessages.map((m, i) => {
            if (m.systemMessage) {
              return (
                <div key={i} className="system-message">
                  {m.message}
                </div>
              );
            }

            const isMine = m.sender === nickname.current;

            return (
              <div
                key={i}
                className={`chat-message-row ${isMine ? "mine" : "other"}`}
              >
                {!isMine && (
                  <div className="chat-avatar">
                    <img
                      src={smallLogo}
                      alt="프로필"
                      className="chat-avatar-img"
                    />
                  </div>
                )}

                <div className="chat-bubble-block">
                  {!isMine && (
                    <div className="chat-sender-name">{m.sender}</div>
                  )}
                  <div className="chat-bubble">
                    <span className="chat-message-text">{m.message}</span>
                  </div>
                  {m.time && (
                    <div className="chat-message-time">{m.time}</div>
                  )}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* 입력 영역 */}
        <div className="chat-input-area">
          <div className="chat-input-top">
            <textarea
              value={msg}
              onChange={(e) => setMsg(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage();
                }
              }}
              placeholder="내용을 입력해주세요. (Shift+Enter: 줄바꿈 / Enter: 전송)"
              className="chat-textarea"
              rows={3}
            />
          </div>

          <div className="chat-input-bottom">
            <span className="chat-input-desc">Description</span>
            <button
              onClick={sendMessage}
              type="button"
              className="chat-send-btn"
            >
              보내기
            </button>
          </div>
        </div>
      </div>

      {/* 초대 모달 */}
      {showModal && (
        <div className="invite-modal-bg" onClick={() => setShowModal(false)}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="invite-modal-title">친구 초대</h3>

            <div className="invite-modal-friends">
              <div className="invite-modal-friends-header">
                친구에게 1:1 또는 그룹 대화로 초대하기
              </div>

              {loadingFriends ? (
                <p className="invite-modal-friends-empty">
                  친구 목록을 불러오는 중입니다...
                </p>
              ) : friends.length === 0 ? (
                <p className="invite-modal-friends-empty">
                  등록된 친구가 없습니다.
                </p>
              ) : (
                <div className="invite-modal-friend-list">
                  {friends.map((f) => {
                    const friendId = f.id || f.friendId;
                    const isSelected = selectedGroupIds.includes(friendId);
                    const displayName = f.nickname || f.name || f.id;

                    return (
                      <div
                        key={friendId}
                        className="invite-modal-friend-item"
                      >
                        <div className="invite-modal-friend-left">
                          <div className="invite-modal-friend-avatar">
                            <img
                              src={profileBig}
                              alt="친구"
                              className="invite-modal-friend-avatar-img"
                            />
                          </div>
                          <div className="invite-modal-friend-texts">
                            <div className="invite-modal-friend-name">
                              {displayName}
                            </div>
                            <div className="invite-modal-friend-sub">
                              1:1 또는 그룹 대화로 초대
                            </div>
                          </div>
                        </div>

                        <div className="invite-modal-friend-right">
                          <button
                            type="button"
                            className="invite-modal-friend-btn"
                            onClick={() => handleInviteFriendOneToOne(f)}
                          >
                            1:1 대화
                          </button>
                          <button
                            type="button"
                            className={
                              "invite-modal-friend-btn invite-modal-friend-btn--group" +
                              (isSelected
                                ? " invite-modal-friend-btn--group-selected"
                                : "")
                            }
                            onClick={() => toggleSelectGroupFriend(f)}
                          >
                            그룹 대화
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="invite-modal-group-info">
                <span>
                  선택된 친구 수:{" "}
                  <strong>{selectedGroupIds.length}</strong>명
                </span>
                <button
                  type="button"
                  className="invite-modal-group-start-btn"
                  onClick={handleCreateGroupChatFromModal}
                >
                  선택한 친구들과 그룹 대화 시작
                </button>
              </div>
            </div>

            <div className="invite-modal-link">
              <div className="invite-modal-link-label">초대 링크</div>
              <p className="invite-modal-link-box">{inviteLink}</p>
              <div className="invite-modal-actions">
                <button
                  onClick={copyLink}
                  type="button"
                  className="invite-modal-copy-btn"
                >
                  링크 복사
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  type="button"
                  className="invite-modal-close-btn"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
