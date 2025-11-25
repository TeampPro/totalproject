import { useState, useEffect, useRef } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";

import "../../styles/ChatRoom.css";

export default function ChatRoom() {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId } = useParams();

  // 로그인된 사용자
  const loginUser = JSON.parse(localStorage.getItem("user") || "null");

  // 방 이름(state → 서버 조회 순)
  const initialRoomName = location.state?.roomName || "";
  const [roomName, setRoomName] = useState(initialRoomName);

  const [memberName, setMemberName] = useState("");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msg, setMsg] = useState("");

  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

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

  /** -----------------------------------------------------
   * 🎯 닉네임 결정 규칙 완성본
   * -----------------------------------------------------
   * 1) 회원(userType = NORMAL/ADMIN) → DB 닉네임
   * 2) 비회원 로그인(userType = GUEST) → guest_랜덤
   * 3) 초대 링크 게스트 → 닉네임 입력해서 들어온 값 사용
   * 4) 초대 링크 게스트 재입장 → localStorage.memberName 사용
   * 5) 아무 정보도 없으면 → 초대 링크 닉네임 입력 페이지로 보내기
   * ----------------------------------------------------- */

  useEffect(() => {
    /** 1) 로그인한 회원/관리자 */
    if (loginUser && loginUser.userType !== "GUEST") {
      const nick = loginUser.nickname || loginUser.name || loginUser.id;
      nickname.current = nick;
      setMemberName(nick);
      return;
    }

    /** 2) 비회원 로그인(GUEST) → guest_random */
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

    /** 3) 초대링크 게스트(초대 → 닉네임 입력) */
    const invitedName = location.state?.memberName;
    if (invitedName) {
      nickname.current = invitedName;
      localStorage.setItem("memberName", invitedName);
      setMemberName(invitedName);
      return;
    }

    /** 4) 초대링크 게스트 재입장 */
    const storedGuestName = localStorage.getItem("memberName");
    if (storedGuestName) {
      nickname.current = storedGuestName;
      setMemberName(storedGuestName);
      return;
    }

    /** 5) 아무 정보도 없다 → 초대 링크 닉네임 입력 페이지로 돌아가기 */
    alert("닉네임 정보가 없습니다. 초대 링크로 입장해주세요.");
    navigate("/chat/invite");
  }, []);

  /** 방 이름 조회 */
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

  /** WebSocket 연결 */
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

  /** WebSocket + 방 입장 */
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

  /** 이전 메시지 */
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

  /** 자동 스크롤 */
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  /** 메시지 전송 */
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

  /** 초대 링크 생성 */
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

  return (
    <div className="chat-room">
      {/* 헤더 */}
      <div className="chat-header">
        <h2>💬 {roomName || `채팅방 (${roomId})`}</h2>
        <div>
          <span className={isConnected ? "chat-connection" : "chat-disconnected"}>
            {isConnected ? "● 연결됨" : "● 끊김"}
          </span>
          <button onClick={createInvite}>🔗 초대</button>
        </div>
      </div>

      {/* 참여자 */}
      <div className="chat-members-box">
        <b>참여자 ({members.length})</b>
        <div className="chat-members-list">
          {members.map((m, i) => (
            <span key={i} className="chat-member">• {m}</span>
          ))}
        </div>
      </div>

      {/* 메시지 */}
      <div className="chat-messages" ref={chatBoxRef} onScroll={handleScroll}>
        {messages.map((m, i) =>
          m.systemMessage ? (
            <div key={i} className="system-message">{m.message}</div>
          ) : (
            <div key={i}>
              <b>{m.sender}</b>: {m.message}{" "}
              <span style={{ fontSize: "0.8em" }}>({m.time})</span>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 */}
      <div className="chat-input-wrapper">
        <textarea
          value={msg}
          onChange={(e) => setMsg(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder="메시지 입력 (Shift+Enter 줄바꿈)"
          rows={2}
          className="chat-textarea"
        />

        <button onClick={sendMessage} className="chat-send-btn">
          보내기
        </button>
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
