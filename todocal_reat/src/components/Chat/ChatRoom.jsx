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
  const [isConnected, setIsConnected] = useState(false); // ✅ 연결 상태 표시
  const ws = useRef(null);
  const reconnectTimer = useRef(null);

  // ✅ memberName: 로그인 사용자 이름 또는 localStorage 저장된 이름
  const memberName =
    location.state?.memberName || localStorage.getItem("memberName") || "guest";
  const nickname = useRef(memberName); // nickname = 서버 DB에 저장된 memberName과 일치해야 함

  // ✅ 과거 메시지 불러오기
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

  // ✅ WebSocket 연결 함수
  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return; // 중복 방지

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

      // ✅ 자동 재연결 시도 (2초 후)
      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔁 재연결 시도 중...");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  // ✅ WebSocket 연결 초기화
  useEffect(() => {
    if (ws.current) return;
    connectWebSocket();

    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.close();
      }
    };
  }, []);

  // ✅ 메시지 전송
  const sendMessage = () => {
    if (!msg.trim()) return;

    // ✅ 연결 상태 확인 (닫힌 소켓 방지)
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
      </div>

      <input
        value={msg}
        onChange={(e) => setMsg(e.target.value)}
        placeholder="메시지 입력..."
      />
      <button onClick={sendMessage}>보내기</button>

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
