import { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";

export default function ChatRoom({ room }) {
  const location = useLocation();
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState("");
  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef(null);
  const reconnectTimer = useRef(null);
  const messagesEndRef = useRef(null); // ✅ 새 메시지 스크롤 기준점

  const memberName =
    location.state?.memberName || localStorage.getItem("memberName") || "guest";
  const nickname = useRef(memberName);

  // ✅ 기존 메시지 로드
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

  // ✅ WebSocket 연결
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

      if (e.reason.includes("입장") || e.code === 1008) {
        alert("채팅방 입장 권한이 없습니다.");
        return;
      }

      // 자동 재연결
      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔁 재연결 시도 중...");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  // ✅ WebSocket 연결 (중복 방지 포함)
  useEffect(() => {
    // 이미 연결되어 있으면 다시 연결하지 않음
    if (ws.current && ws.current.readyState !== WebSocket.CLOSED) {
      console.log("⚠️ 이미 WebSocket 연결 중 — 중복 연결 방지");
      return;
    }

    connectWebSocket();

    // cleanup
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close();
        ws.current = null; // ✅ 완전 초기화
      }
    };
  }, []);

  // ✅ 새 메시지 추가 시 스크롤 맨 아래로
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  // ✅ 메시지 전송
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

  // ✅ 초대 링크 생성
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
    <div style={{ padding: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>💬 {room.name}</h2>
        <div>
          <span
            style={{
              color: isConnected ? "green" : "red",
              fontWeight: "bold",
              marginRight: 10,
            }}
          >
            {isConnected ? "● 연결됨" : "● 끊김"}
          </span>
          <button onClick={createInvite}>🔗 초대</button>
        </div>
      </div>

      <div
        style={{
          border: "1px solid #ccc",
          height: 300,
          overflowY: "auto",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div key={i}>
            <b>{m.sender}</b>: {m.message}{" "}
            <span style={{ fontSize: "0.8em" }}>({m.time})</span>
          </div>
        ))}
        {/* 👇 스크롤 기준점 */}
        <div ref={messagesEndRef} />
      </div>

      {/* ✅ 메시지 입력 + 전송 (Enter=전송, Shift+Enter=줄바꿈) */}
      <div style={{ display: "flex", gap: 8 }}>
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
          style={{
            flex: 1,
            resize: "none",
            padding: 8,
            borderRadius: 8,
            border: "1px solid #ccc",
          }}
        />
        <button
          onClick={sendMessage}
          style={{
            padding: "8px 16px",
            borderRadius: 8,
            border: "none",
            backgroundColor: "#4caf50",
            color: "white",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          보내기
        </button>
      </div>

      {/* ✅ 초대 링크 모달 */}
      {showModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: "white",
              padding: 20,
              borderRadius: 10,
              minWidth: 300,
              textAlign: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
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
