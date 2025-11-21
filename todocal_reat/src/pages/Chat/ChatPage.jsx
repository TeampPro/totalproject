import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Chat/ChatPage.css"

export default function ChatPage({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 채팅방 목록 불러오기
  useEffect(() => {
    const memberName =
      user?.name || localStorage.getItem("memberName") || "guest";

    localStorage.setItem("memberName", memberName);

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
        setLoading(false);
      }
    };

    fetchRooms();
  }, [user]);

  // 방 입장
  const handleEnterRoom = async (room) => {
    try {
      const memberName =
        user?.name || localStorage.getItem("memberName") || "guest";

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
      const memberName =
        user?.name || localStorage.getItem("memberName") || "guest";

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

  // 방 이름 변경
  const handleRenameRoom = async (e, room) => {
    e.stopPropagation();

    const newName = window.prompt(
      "새 채팅방 이름을 입력하세요.",
      room.name || ""
    );
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

  // 방 삭제
  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation();

    if (!window.confirm("이 채팅방을 삭제할까요?")) return;

    try {
      await axios.delete(`/api/chat/rooms/${roomId}`);
      setRooms((prev) => prev.filter((r) => r.id !== roomId));
    } catch (err) {
      console.error("❌ 채팅방 삭제 오류:", err);
      alert("채팅방 삭제에 실패했습니다.");
    }
  };

  if (loading) return <p className="loading">채팅방 목록 불러오는 중...</p>;

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2>채팅방 목록</h2>
        <button className="create-room-btn" onClick={handleCreateRoom}>
          ➕ 새 채팅방 만들기
        </button>
      </div>

      {rooms.length === 0 ? (
        <p>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ul className="chat-room-list">
          {rooms.map((room) => (
            <li
              key={room.id}
              className="chat-room-item"
              onClick={() => handleEnterRoom(room)}
            >
              <div className="chat-room-info">
                <div className="chat-room-name">{room.name}</div>
                <div className="chat-room-participants">
                  참여자: {room.participantCount ?? 0}명
                </div>
              </div>

              <div className="chat-buttons">
                <button
                  className="rename-btn"
                  onClick={(e) => handleRenameRoom(e, room)}
                >
                  이름 변경
                </button>

                <button
                  className="delete-btn"
                  onClick={(e) => handleDeleteRoom(e, room.id)}
                >
                  삭제
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
