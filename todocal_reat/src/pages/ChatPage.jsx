import ChatRoomList from "../components/Chat/ChatRoomList";

export default function ChatPage() {
  return (
    <div style={{ padding: 20 }}>
      <h1>💬 실시간 채팅</h1>
      <ChatRoomList />
    </div>
  );
}
