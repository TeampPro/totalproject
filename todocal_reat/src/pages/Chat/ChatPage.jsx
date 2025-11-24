import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // 🔹 로그인 사용자 정보
  const loginUser = JSON.parse(localStorage.getItem("user") || "null");

  // 🔹 채팅에서 사용할 내 닉네임 계산 함수
  const getMemberName = () => {
    // 1) 회원 / 관리자
    if (loginUser && loginUser.userType !== "GUEST") {
      const nick = loginUser.nickname || loginUser.name || loginUser.id;
      // 회원/관리자는 guest용 memberName 안 쓰는 게 깔끔하지만,
      // 혹시나 위해 여기에도 저장해두긴 함
      localStorage.setItem("memberName", nick);
      return nick;
    }

    // 2) 비회원 로그인(GUEST)
    if (loginUser && loginUser.userType === "GUEST") {
      // 비회원 로그인 시 user.id 나 nickname 이 있을 수 있음
      const stored = localStorage.getItem("memberName");
      const guestNick =
        stored ||
        loginUser.nickname ||
        loginUser.name ||
        loginUser.id ||
        `guest_${Math.random().toString(36).substring(2, 8)}`;

      localStorage.setItem("memberName", guestNick);
      return guestNick;
    }

    // 3) 로그인 안 한 상태 (초대 링크 게스트 등)
    const fromStorage = localStorage.getItem("memberName");
    if (fromStorage) return fromStorage;

    const fallback = "GUEST";
    localStorage.setItem("memberName", fallback);
    return fallback;
  };

  // ✅ 채팅방 목록 불러오기
  useEffect(() => {
    const memberName = getMemberName();

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
  }, []); // user prop 안 쓰므로 의존성 제거

  // ✅ 방 입장
  const handleEnterRoom = async (room) => {
    try {
      const memberName = getMemberName();

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

  // ✅ 새 채팅방 생성
  const handleCreateRoom = async () => {
    try {
      const memberName = getMemberName();

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

  // ✅ 방 이름 변경
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

  // ✅ 방 삭제
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

  if (loading) return <p style={{ padding: 20 }}>채팅방 목록 불러오는 중...</p>;

  return (
    <div style={{ padding: 16 }}>
      {/* 상단: 제목 + 새 채팅방 버튼 */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h2>채팅방 목록</h2>
        <button
          onClick={handleCreateRoom}
          style={{
            padding: "8px 14px",
            borderRadius: 6,
            border: "none",
            background: "#4caf50",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          ➕ 새 채팅방 만들기
        </button>
      </div>

      {rooms.length === 0 ? (
        <p>참여 중인 채팅방이 없습니다.</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0, marginTop: 10 }}>
          {rooms.map((room) => (
            <li
              key={room.id}
              style={{
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd",
                marginBottom: 8,
                background: "#fff",
                cursor: "pointer",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
              onClick={() => handleEnterRoom(room)}
            >
              <div>
                <div style={{ fontWeight: "bold" }}>{room.name}</div>
                <div style={{ fontSize: "12px", color: "#666" }}>
                  참여자: {room.participantCount ?? 0}명
                </div>
              </div>

              <div style={{ display: "flex", gap: 8 }}>
                <button
                  onClick={(e) => handleRenameRoom(e, room)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #1976d2",
                    background: "#fff",
                    cursor: "pointer",
                  }}
                >
                  이름 변경
                </button>

                <button
                  onClick={(e) => handleDeleteRoom(e, room.id)}
                  style={{
                    padding: "4px 8px",
                    fontSize: 12,
                    borderRadius: 6,
                    border: "1px solid #f44336",
                    background: "#fff",
                    color: "#f44336",
                    cursor: "pointer",
                  }}
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
