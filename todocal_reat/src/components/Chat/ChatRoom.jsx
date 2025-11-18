import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";

import "../../styles/ChatRoom.css";

export default function ChatRoom({ room }) {
  const location = useLocation();

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

  /* 🔥 추가된 부분: 채팅창 스크롤 상태 관리 */
  const chatBoxRef = useRef(null); 
  const [autoScroll, setAutoScroll] = useState(true);

  // 🔥 사용자 스크롤 시 자동 스크롤 여부 판단
  const handleScroll = () => {
    if (!chatBoxRef.current) return;

    const { scrollTop, clientHeight, scrollHeight } = chatBoxRef.current;
    
    // 사용자가 거의 맨 아래 보고 있을 때만 autoScroll 유지
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;

    setAutoScroll(isBottom);
  };
  /* 🔥 추가 끝 */

  // memberName 초기화
  useEffect(() => {
    const nameFromState = location.state?.memberName;
    const nameFromStorage = localStorage.getItem("memberName");

    const finalName = nameFromState || nameFromStorage;

    if (!finalName) {
      alert("닉네임 정보를 찾을 수 없습니다. 초대 링크로 다시 입장해주세요.");
      return;
    }

    setMemberName(finalName);
    nickname.current = finalName;
  }, []);

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/chat?roomId=${room.id}&memberName=${nickname.current}`
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

      if (data.roomId === room.id) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket 오류:", err);
    };

    socket.onclose = (e) => {
      console.warn("❌ WebSocket 종료됨", e.code, e.reason);
      setIsConnected(false);

      if (e.code === 1008 && e.reason === "DUPLICATE_SESSION") return;
      if (e.code === 1008 && e.reason.includes("입장")) {
        alert("채팅방 입장 권한이 없습니다.");
        return;
      }

      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔁 재연결 시도 중...");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  useEffect(() => {
    if (!memberName) return;

    connectWebSocket();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null;
      }
    };
  }, [memberName]);

  // 메시지 로드
  useEffect(() => {
    const loadOldMessages = async () => {
      const data = await fetchMessages(room.id);
      setMessages(
        data.length > 0
          ? data
          : [{ sender: "SYSTEM", message: "아직 메시지가 없습니다.", time: "" }]
      );
    };
    loadOldMessages();
  }, [room.id]);

  // 🔥 자동 스크롤 (자동 스크롤 켜져 있을 때만)
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // 메시지 전송
  const sendMessage = () => {
    if (!msg.trim()) return;

    if (!ws.current || ws.current.readyState !== WebSocket.OPEN) {
      alert("서버와의 연결이 끊어졌습니다. 잠시 후 다시 시도해주세요.");
      return;
    }

    const payload = {
      type: "chat",
      sender: nickname.current,
      message: msg,
      roomId: room.id,
    };

    ws.current.send(JSON.stringify(payload));
    setMsg("");
  };

  // 초대 링크 생성
  const createInvite = async () => {
    try {
      const res = await axios.post(`/api/chat/rooms/${room.id}/invite`);
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

      {/* 상단 */}
      <div className="chat-header">
        <h2>💬 {room.name}</h2>
        <div>
          <span className={isConnected ? "chat-connection" : "chat-disconnected"}>
            {isConnected ? "● 연결됨" : "● 끊김"}
          </span>
          <button onClick={createInvite}>🔗 초대</button>
        </div>
      </div>

      {/* 참여자 목록 */}
      <div className="chat-members-box">
        <b>참여자 ({members.length})</b>
        <div className="chat-members-list">
          {members.map((m, i) => (
            <span key={i} className="chat-member">
              • {m}
            </span>
          ))}
        </div>
      </div>

      {/* 메시지 리스트 */}
      <div
        className="chat-messages"
        ref={chatBoxRef}
        onScroll={handleScroll}   // 🔥 스크롤 이벤트 추가
      >
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

      {/* 입력창 */}
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
          placeholder="메시지를 입력하세요 (Shift+Enter로 줄바꿈)"
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

ChatRoom.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
};
