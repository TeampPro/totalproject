import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { fetchMessages } from "../../api/chatApi";

export default function ChatRoom({ room, onBack }) {
  const [messages, setMessages] = useState([]);
  const [msg, setMsg] = useState('');
  const ws = useRef(null);
  const nickname = useRef(`user-${Math.floor(Math.random() * 1000)}`);

  // 과거 메시지 불러오기
  useEffect(() => {
    const loadOldMessages = async () => {
      const data = await fetchMessages(room.id);
      setMessages(data.length > 0 ? data : [{ sender: "SYSTEM", message: "아직 메시지가 없습니다.", time: "" }]);
    };
    loadOldMessages();
  }, [room.id]);

  // WebSocket 연결
  useEffect(() => {
    ws.current = new WebSocket(`ws://localhost:8080/ws/chat`);

    ws.current.onopen = () => console.log('✅ WebSocket 연결됨');
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.roomId === room.id) {
        setMessages((prev) => [...prev, data]);
      }
    };
    ws.current.onclose = () => console.log('❌ WebSocket 종료됨');

    return () => ws.current && ws.current.close();
  }, [room.id]);

  const sendMessage = () => {
    if (!msg.trim()) return;
    const payload = {
      type: "chat",
      sender: nickname.current,
      message: msg,
      roomId: room.id,
    };
    ws.current.send(JSON.stringify(payload));
    setMsg('');
  };

  return (
    <div style={{ padding: 20 }}>
      <button onClick={onBack}>← 돌아가기</button>
      <h2>💬 {room.name || "(이름 없음)"}</h2>

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
    </div>
  );
}

ChatRoom.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};