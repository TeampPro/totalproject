import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function ChatPage({ user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // ✅ 채팅방 목록 불러오기
  useEffect(() => {
    const memberName =
      user?.name || localStorage.getItem("memberName") || "guest";

    localStorage.setItem("memberName", memberName);

    const fetchRooms = async () => {
      try {
        // 내가 참여한 방만 가져오기
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

  // ✅ 방 입장
  const handleEnterRoom = (room) => {
    const memberName = localStorage.getItem("memberName");
    navigate(`/chat/${room.id}`, {
      state: { memberName : room.name },
    });
  };

  // ✅ 새 채팅방 생성
  const handleCreateRoom = async () => {
    try {
      const memberName = localStorage.getItem("memberName");

      // 필요하면 방 이름을 생성 시점에 받으려면 주석 해제해서 사용
      // const name = window.prompt("채팅방 이름을 입력하세요", `${memberName}의 채팅방`);
      // if (name === null) return;

      const res = await axios.post("/api/chat/rooms", null, {
        params: { memberName }, // name을 query나 body로 넘기려면 백엔드에 맞게 수정
      });

      if (res.data && res.data.id) {
        // 리스트에 추가
        setRooms((prev) => [...prev, res.data]);

        // 바로 입장
        navigate(`/chat/${res.data.id}`, {
          state: { memberName },
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
    e.stopPropagation(); // li onClick(입장) 막기

    const newName = window.prompt(
      "새 채팅방 이름을 입력하세요.",
      room.name || ""
    );
    if (newName === null) return; // 취소

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

      // 상태에서 해당 방 이름만 업데이트
      setRooms((prev) =>
        prev.map((r) =>
          r.id === room.id ? { ...r, name: updatedName } : r
        )
      );
    } catch (err) {
      console.error("❌ 채팅방 이름 변경 오류:", err);
      alert("채팅방 이름 변경에 실패했습니다.");
    }
  };

  // ✅ 방 삭제
  const handleDeleteRoom = async (e, roomId) => {
    e.stopPropagation(); // li 클릭(입장)과 구분

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
