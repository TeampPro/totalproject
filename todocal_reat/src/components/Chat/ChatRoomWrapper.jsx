import { useParams, useLocation } from "react-router-dom";
import ChatRoom from "./ChatRoom";

export default function ChatRoomWrapper() {
  const { roomId } = useParams();
  const location = useLocation();

  return (
    <ChatRoom
      room={{ id: roomId }}
      memberName={location.state?.memberName}
    />
  )
}