import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";

import profileBig from "../../assets/profileBig.svg";
import peopleIcon from "../../assets/people.svg";
import searchIcon from "../../assets/search.svg";
import menuIcon from "../../assets/menu.svg";
import smallLogo from "../../assets/smalllogo.svg";       // 말풍선 아바타용
import smallProfile from "../../assets/smallprofil.svg";  // 참여자 목록 기본 프로필
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
  const [msg, setMsg] = useState("");
  const [searchText, setSearchText] = useState("");

  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);

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

  /* 닉네임 결정 */
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

  /* 방 이름 조회 */
  useEffect(() => {
    if (roomName) return;

    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}`);
        if (res.data?.name) setRoomName(res.data.name);
      } catch (err) {
        console.error("채팅방 정보 조회 실패:", err);
      }
    };
    if (roomId) fetchRoomInfo();
  }, [roomId, roomName]);

  /* WebSocket 연결 */
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
      console.log("✅ WebSocket 연결됨");
      setIsConnected(true);

      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
        reconnectTimer.current = null;
      }
    };

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (Array.isArray(data.members)) {
        setMembers(data.members);
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
      console.warn("❌ WebSocket 종료됨", e.code, e.reason);
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

  /* WebSocket + 방 입장 */
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

  /* 이전 메시지 */
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

  /* 자동 스크롤 */
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  /* 메시지 전송 */
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

  /* 초대 링크 생성 – 메뉴의 "친구 초대하기"에서만 사용 */
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

  /* 검색 필터 */
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
            {/* 상단 친구 초대 버튼 제거됨 */}
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

                // 객체 형태의 참여자일 경우, 여러 필드에서 프로필 URL 탐색
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
            <h3>초대 링크</h3>
            <p style={{ wordBreak: "break-all" }}>{inviteLink}</p>
            <button onClick={copyLink}>복사</button>
            <button onClick={() => setShowModal(false)}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}
