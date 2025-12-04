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

  // 🔹 초대 모달 에러 메시지 (중복 초대 등)
  const [inviteError, setInviteError] = useState("");

  // ✅ 방 입장 시, localStorage에 저장된 멤버 목록 복원
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}`);
        const data = res.data || {};

        // ✅ 서버에서 내려준 이름으로 항상 덮어쓰기
        if (data.name) {
          setRoomName(data.name);
        }

        let list = [];
        if (Array.isArray(data.members)) list = data.members;
        else if (Array.isArray(data.participants)) list = data.participants;
        else if (Array.isArray(data.participantList))
          list = data.participantList;

        if (list.length === 0) return;

        setMembers((prev) => {
          const merged = [...prev];
          const exists = new Set(prev.map((m) => getMemberKey(m)));

          list.forEach((m) => {
            const key = getMemberKey(m);
            if (key && !exists.has(key)) {
              exists.add(key);
              merged.push(m);
            }
          });

          return merged;
        });
      } catch (err) {
        console.error("채팅방 정보 조회 실패:", err);
      }
    };

    fetchRoomInfo();
  }, [roomId]); // ✅ roomId만 의존

  // location.state.initialMembers가 있으면 우선 적용
  useEffect(() => {
    const state = location.state;
    if (
      state &&
      Array.isArray(state.initialMembers) &&
      state.initialMembers.length > 0
    ) {
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
  // ChatRoom 컴포넌트 내부, useState들 정의 아래 아무 데나
  // ChatRoom 컴포넌트 안, useState들 아래
  const getMemberKey = (m) => {
    if (!m) return "";
    if (typeof m === "string") return m;

    const nick =
      m.nickname ||
      m.name ||
      m.memberName || // 서버가 memberName 으로 줄 수도 있음
      m.sender;

    // 닉네임/이름이 있으면 그걸 우선 키로 사용
    if (nick) return String(nick);

    // 그 외에는 id 계열로 키 생성
    return (
      m.id ||
      m.userId ||
      m.friendId ||
      m.memberId ||
      m.username ||
      JSON.stringify(m)
    );
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

  // ✅ 방 정보에서 참여자 목록 및 방 이름을 가져와서 반영
  useEffect(() => {
    if (!roomId) return;

    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}`);
        const data = res.data || {};

        // 방 이름 세팅 (초대 링크로 직접 들어온 경우 roomName이 비어있을 수 있음)
        if (data.name && !roomName) {
          setRoomName(data.name);
        }

        // 백엔드에서 내려줄 수 있는 여러 필드 케이스 고려 (멤버)
        let list = [];
        if (Array.isArray(data.members)) list = data.members;
        else if (Array.isArray(data.participants)) list = data.participants;
        else if (Array.isArray(data.participantList))
          list = data.participantList;

        if (list.length === 0) return;

        // ✅ 기존 members와 합치기 (중복 제거)
        setMembers((prev) => {
          const merged = [...prev];
          const exists = new Set(prev.map((m) => getMemberKey(m)));

          list.forEach((m) => {
            const key = getMemberKey(m);
            if (key && !exists.has(key)) {
              exists.add(key);
              merged.push(m);
            }
          });

          return merged;
        });
      } catch (err) {
        console.error("채팅방 정보 조회 실패:", err);
      }
    };

    fetchRoomInfo();
  }, [roomId, roomName]);

  // ✅ members가 바뀔 때마다 roomId별로 localStorage에 저장
  useEffect(() => {
    if (!roomId) return;
    if (!members || members.length === 0) return;

    try {
      localStorage.setItem(
        `chat_room_members_${roomId}`,
        JSON.stringify(members)
      );
    } catch (e) {
      console.error("방 멤버 목록 저장 실패:", e);
    }
  }, [roomId, members]);

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

      // 공통 멤버 병합 함수 (중복 제거)
      // socket.onmessage 안쪽
      const mergeMembers = (incoming) => {
        if (!incoming) return;

        const list = Array.isArray(incoming) ? incoming : [incoming];

        setMembers((prev) => {
          const merged = [...prev];
          const exists = new Set(prev.map((m) => getMemberKey(m)));

          list.forEach((m) => {
            const key = getMemberKey(m);
            if (key && !exists.has(key)) {
              exists.add(key);
              merged.push(m);
            }
          });

          return merged;
        });
      };

      // ✅ 1) 서버가 전체 멤버 배열을 보내주는 경우
      if (Array.isArray(data.members)) {
        mergeMembers(data.members);
        return;
      }
      if (Array.isArray(data.participants)) {
        mergeMembers(data.participants);
        return;
      }
      if (Array.isArray(data.participantList)) {
        mergeMembers(data.participantList);
        return;
      }

      // ✅ 2) 초대로 새 멤버 한 명이 들어오는 이벤트 형태 (예: MEMBER_JOINED, JOIN 등)
      if (
        data.type === "MEMBER_JOINED" ||
        data.type === "JOIN" ||
        data.type === "MEMBER_ADDED"
      ) {
        if (data.member) {
          mergeMembers(data.member);
          return;
        }
      }

      // 타입 없이 단순히 member 한 명만 오는 경우까지 대비
      if (data.member && !data.message && !data.roomId) {
        mergeMembers(data.member);
        return;
      }

      // ✅ 3) 그 외에는 채팅 메시지로 처리
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket 오류:", err);
    };

    socket.onclose = (e) => {
      setIsConnected(false);

      // 정상 종료 / 권한 문제 등은 재연결하지 않음
      if (e.code === 1000) return;
      if (e.code === 1008) return;
      if (e.code === 1003) {
        alert(e.reason || "채팅방 입장 권한이 없습니다.");
        navigate("/chat");
        return;
      }

      // 그 외에는 자동 재연결 시도
      reconnectTimer.current = setTimeout(() => connectWebSocket(), 2000);
    };
  };

  useEffect(() => {
    if (!memberName || !roomId) return;

    const skipJoin = location.state?.skipJoin;

    let cancelled = false;

    const joinAndConnect = async () => {
      try {
        // ✅ 새로 만든 1:1 방처럼, 이미 서버에 join 되어 있는 경우
        if (skipJoin) {
          if (!cancelled) connectWebSocket();
          return;
        }

        // ✅ 그 외 일반적인 경우에는 join → WebSocket 연결
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
  }, [memberName, roomId, location.state?.skipJoin]);

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
      setInviteError("");
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

  // 🔹 모달 내 1:1 버튼용: 선택한 친구와 1:1 채팅방 생성 후 이동
  const handleInviteFriendOneToOne = async (friend) => {
    try {
      const baseName =
        nickname.current ||
        memberName ||
        loginUser?.nickname ||
        loginUser?.name ||
        loginUser?.id;

      const friendName = friend.nickname || friend.name || friend.id;

      if (!baseName || !friendName) {
        alert("1:1 대화에 필요한 정보가 부족합니다.");
        return;
      }

      // 1) 새 1:1 방 생성
      const resRoom = await axios.post("/api/chat/rooms", null, {
        params: { memberName: baseName },
      });

      if (!resRoom.data || !resRoom.data.id) {
        throw new Error("1:1 방 생성 실패");
      }

      const newRoom = resRoom.data;

      // 2) 친구 참여자로 추가
      try {
        await axios.post(`/api/chat/rooms/${newRoom.id}/join`, null, {
          params: { memberName: friendName },
        });
      } catch (e) {
        console.error("친구 1:1 방 참여 실패:", e);
      }

      // 3) 방 이름 변경
      // 3) 방 이름 변경
      const title = `${baseName} & ${friendName}`;
      try {
        const renameRes = await axios.patch(
          `/api/chat/rooms/${newRoom.id}/name`,
          {
            name: title,
          }
        );
        newRoom.name = renameRes.data?.name || title;
      } catch (e) {
        console.error("1:1 방 이름 변경 실패:", e);
        newRoom.name = title;
      }

      // ✅ 4) 새 1:1 방으로 이동 + 초기 멤버 전달
      // 4) 새 1:1 방으로 이동 + 초기 멤버 전달
      const myMemberObj = {
        id: loginUser?.id,
        nickname: baseName,
        name: baseName,
      };
      const friendMemberObj = {
        id: friend.id || friend.friendId || friend.userId,
        nickname: friendName,
        name: friend.name || friend.nickname || friend.id,
      };

      navigate(`/chat/${newRoom.id}`, {
        state: {
          roomName: newRoom.name,
          memberName: baseName,
          initialMembers: [myMemberObj, friendMemberObj],
          skipJoin: true, // ✅ 이 방은 이미 내가 참여자로 등록된 상태다!
        },
      });

      setShowModal(false);
      setInviteError("");
    } catch (e) {
      console.error("1:1 대화방 생성 실패:", e);
      alert("1:1 대화방 생성 중 오류가 발생했습니다.");
    }
  };

  // 🔹 '대화방 초대': 해당 친구를 현재 방에 바로 초대
  // 🔹 '대화방 초대': 해당 친구를 현재 방에 바로 초대
  const handleInviteFriendToCurrentRoom = async (friend) => {
    try {
      if (!roomId) return;

      setInviteError("");

      const friendName = friend.nickname || friend.name || friend.id || "친구";

      // ✅ 공통 키로 비교
      const friendKey = getMemberKey(friend);
      const existingKeys = new Set(members.map((m) => getMemberKey(m)));

      if (friendKey && existingKeys.has(friendKey)) {
        setInviteError("현재 방에 이미 존재하는 사람입니다!");
        return;
      }

      // 1) 백엔드에 친구를 현재 방 참여자로 추가
      await axios.post(`/api/chat/rooms/${roomId}/join`, null, {
        params: { memberName: friendName },
      });

      // 2) 프론트 members에도 반영 (중복 방지)
      setMembers((prev) => {
        const merged = [...prev];
        const exists = new Set(prev.map((m) => getMemberKey(m)));

        if (!exists.has(friendKey)) {
          exists.add(friendKey);
          merged.push({
            id: friend.id || friend.friendId || friend.userId,
            nickname: friendName,
            name: friend.name || friend.nickname || friend.id,
          });
        }

        return merged;
      });

      // 3) 시스템 메시지
      setMessages((prev) => [
        ...prev,
        {
          systemMessage: true,
          message: `${friendName}님이 입장했습니다.`,
          time: "",
        },
      ]);

      alert(`${friendName}님을 대화방에 초대했습니다.`);
    } catch (e) {
      console.error("대화방 초대 실패:", e);
      alert("해당 친구를 대화방에 초대하는 중 오류가 발생했습니다.");
    }
  };

  // 🔹 메시지 텍스트 안의 URL을 자동으로 링크로 렌더링
  const renderMessageText = (text) => {
    if (!text) return null;

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);

    return parts.map((part, idx) => {
      if (/^https?:\/\/[^\s]+$/.test(part)) {
        return (
          <a
            key={idx}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="chat-message-link"
          >
            {part}
          </a>
        );
      }
      return <span key={idx}>{part}</span>;
    });
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

  const handleCloseModal = () => {
    setShowModal(false);
    setInviteError("");
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
        <div className="chat-messages" ref={chatBoxRef} onScroll={handleScroll}>
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
                    <span className="chat-message-text">
                      {renderMessageText(m.message)}
                    </span>
                  </div>
                  {m.time && <div className="chat-message-time">{m.time}</div>}
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
        <div className="invite-modal-bg" onClick={handleCloseModal}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="invite-modal-title">친구 초대</h3>

            <div className="invite-modal-friends">
              <div className="invite-modal-friends-header">
                친구에게 1:1 또는 초대하기
              </div>

              {/* 🔴 중복 초대 에러 메시지 출력 */}
              {inviteError && (
                <p className="invite-modal-error">{inviteError}</p>
              )}

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
                    const displayName = f.nickname || f.name || f.id;

                    return (
                      <div key={friendId} className="invite-modal-friend-item">
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
                              1:1 또는 대화방 초대
                            </div>
                          </div>
                        </div>

                        <div className="invite-modal-friend-right">
                          {/* 1:1 대화 버튼 */}
                          <button
                            type="button"
                            className="invite-modal-friend-btn chat-friend-chat-btn"
                            onClick={() => handleInviteFriendOneToOne(f)}
                          >
                            1:1 대화
                          </button>

                          {/* 대화방 초대 버튼 */}
                          <button
                            type="button"
                            className="invite-modal-friend-btn invite-modal-friend-btn--group"
                            onClick={() => handleInviteFriendToCurrentRoom(f)}
                          >
                            대화방 초대
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
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
                  onClick={handleCloseModal}
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
