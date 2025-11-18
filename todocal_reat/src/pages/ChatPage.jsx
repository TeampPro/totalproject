import axios from "axios";
import { useEffect, useState } from "react";
import ChatRoom from "../components/Chat/ChatRoom";

export default function ChatPage({ user }) {
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 로그인 사용자 이름 불러오기
    const memberName =
      user?.name || localStorage.getItem("memberName") || "guest";

    // localStorage에 로그인 이름 저장
    localStorage.setItem("memberName", memberName);

    const createRoom = async () => {
      try {
        const res = await axios.post("/api/chat/room/auto", null, {
          params: { memberName },
        });

        if (res.data && res.data.id) {
          setRoom(res.data);
        } else {
          console.error("응답 데이터 이상:", res.data);
          alert("채팅방 정보를 불러오지 못했습니다.");
        }
      } catch (err) {
        console.error("❌ 채팅방 생성 오류:", err);
        alert("채팅방 생성 중 문제가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    createRoom();
  }, [user]);

  if (loading) return <p style={{ padding: 20 }}>채팅방 준비 중...</p>;
  if (!room) return <p style={{ padding: 20, color: "red" }}>❌ 채팅방 생성 실패</p>;

  return <ChatRoom room={room} />;
}