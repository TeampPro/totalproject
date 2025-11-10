import { useEffect, useState } from "react";
import { fetchChatRooms, createChatRoom } from "../../api/chatApi";
import ChatRoom from "./ChatRoom";
import PropTypes from "prop-types";

export default function ChatRoomList() {
  const [rooms, setRooms] = useState([]);
  const [newRoom, setNewRoom] = useState("");
  const [selectedRoom, setSelectedRoom] = useState(null);

  // 방 목록 로드
  const loadRooms = async () => {
    const data = await fetchChatRooms();
    setRooms(data);
  };

  useEffect(() => {
    loadRooms();
  }, []);

  // 방 생성
  const handleCreateRoom = async () => {
    if (!newRoom.trim()) return;
    await createChatRoom(newRoom);
    setNewRoom("");
    loadRooms();
  };

  if (selectedRoom) {
    return <ChatRoom room={selectedRoom} onBack={() => setSelectedRoom(null)} />;
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>💬 채팅방 목록</h2>

      <div style={{ marginBottom: 10 }}>
        <input
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
          placeholder="새 채팅방 이름 입력"
        />
        <button onClick={handleCreateRoom}>방 만들기</button>
      </div>

      {rooms.length === 0 ? (
        <p style={{ color: "#888" }}>❌ 현재 생성된 채팅방이 없습니다.</p>
      ) : (
        <ul>
          {rooms.map((r) => (
            <li key={r.id}>
              <button onClick={() => setSelectedRoom(r)}>
                {r.name || "(이름 없음)"}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/* ✅ PropTypes 정의 추가 */
ChatRoomList.propTypes = {
  // 현재 ChatRoomList는 외부에서 props를 직접 받지 않지만
  // ESLint가 future-proof 용으로 경고하지 않도록 기본 구조를 정의합니다.
};

ChatRoom.propTypes = {
  room: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
  }).isRequired,
  onBack: PropTypes.func.isRequired,
};
