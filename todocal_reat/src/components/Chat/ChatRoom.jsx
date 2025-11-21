import { useState, useEffect, useRef } from "react";
import { useLocation, useParams } from "react-router-dom";
import axios from "axios";
import { fetchMessages } from "../../api/chatApi";

import "../../styles/Chat/ChatRoom.css";

export default function ChatRoom() {
  const location = useLocation();
  const { roomId } = useParams();

  // ✅ 방 제목: 라우터 state에서 우선 가져오고, 없으면 나중에 서버에서 조회
  const initialRoomName = location.state?.roomName || "";
  const [roomName, setRoomName] = useState(initialRoomName);

  const [memberName, setMemberName] = useState("");
  const [messages, setMessages] = useState([]);
  const [members, setMembers] = useState([]);
  const [msg, setMsg] = useState("");

  const [inviteLink, setInviteLink] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const ws = useRef(null);
  const nickname = useRef("");
  const reconnectTimer = useRef(null);
  const messagesEndRef = useRef(null);

  // 스크롤 관련
  const chatBoxRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  const handleScroll = () => {
    if (!chatBoxRef.current) return;
    const { scrollTop, clientHeight, scrollHeight } = chatBoxRef.current;
    const isBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isBottom);
  };

  // ✅ memberName 초기화 (state → localStorage 순서)
  useEffect(() => {
    const nameFromState = location.state?.memberName;
    const nameFromStorage = localStorage.getItem("memberName");
    const finalName = nameFromState || nameFromStorage;

    if (!finalName) {
      alert("닉네임 정보를 찾을 수 없습니다. 초대 링크로 다시 입장해주세요.");
      return;
    }

    setMemberName(finalName);
    nickname.current = finalName;
  }, [location.state]);

  // ✅ 방 이름이 없으면 서버에서 다시 조회 (GET /api/chat/rooms/{roomId})
  useEffect(() => {
    if (roomName) return; // 이미 state에 있으면 건너뜀

    const fetchRoomInfo = async () => {
      try {
        const res = await axios.get(`/api/chat/rooms/${roomId}`);
        if (res.data?.name) {
          setRoomName(res.data.name);
        }
      } catch (err) {
        console.error("채팅방 정보 조회 실패:", err);
      }
    };

    if (roomId) {
      fetchRoomInfo();
    }
  }, [roomId, roomName]);

  const connectWebSocket = () => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) return;
    if (!roomId || !nickname.current) return;

    const socket = new WebSocket(
      `ws://localhost:8080/ws/chat?roomId=${roomId}&memberName=${encodeURIComponent(
        nickname.current
      )}`
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

      // 멤버 리스트 갱신 패킷
      if (Array.isArray(data.members)) {
        setMembers(data.members);
        return;
      }

      // 일반 채팅 메시지
      if (data.roomId === roomId) {
        setMessages((prev) => [...prev, data]);
      }
    };

    socket.onerror = (err) => {
      console.error("⚠️ WebSocket 오류:", err);
    };

    socket.onclose = (e) => {
      console.warn("❌ WebSocket 종료됨", e.code, e.reason);
      setIsConnected(false);

      if (e.code === 1000) {
        console.log("✅ 정상 종료이므로 재연결하지 않습니다.");
        return;
      }

      if (e.code === 1008 && e.reason === "DUPLICATE_SESSION") {
        console.warn("중복 접속으로 기존 세션이 정리되었습니다. 재연결 중단.");
        return;
      }

      if (e.code === 1003 && e.reason.includes("입장")) {
        alert(e.reason || "채팅방 입장 권한이 없습니다.");
        return;
      }

      if (!reconnectTimer.current) {
        reconnectTimer.current = setTimeout(() => {
          console.log("🔁 재연결 시도 중...");
          connectWebSocket();
        }, 2000);
      }
    };
  };

  // ✅ 방 입장(멤버 등록) 후 WebSocket 연결
  useEffect(() => {
    if (!memberName || !roomId) return;

    let cancelled = false;

    const joinAndConnect = async () => {
      try {
        // 멤버 등록 (이미 등록되어 있으면 joinRoom이 내부에서 무시)
        await axios.post(`/api/chat/rooms/${roomId}/join`, null, {
          params: { memberName },
        });

        if (!cancelled) {
          connectWebSocket();
        }
      } catch (err) {
        console.error("❌ 채팅방 입장 실패:", err);
        if (!cancelled) {
          alert("채팅방에 입장할 수 없습니다.");
        }
      }
    };

    joinAndConnect();

    return () => {
      cancelled = true;
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      if (ws.current) {
        ws.current.close(1000, "COMPONENT_UNMOUNT");
        ws.current = null;
      }
    };
  }, [memberName, roomId]);

  // ✅ 이전 메시지 로드
  useEffect(() => {
    const loadOldMessages = async () => {
      const data = await fetchMessages(roomId);
      setMessages(
        data.length > 0
          ? data
          : [{ sender: "SYSTEM", message: "아직 메시지가 없습니다.", time: "" }]
      );
    };
    if (roomId) {
      loadOldMessages();
    }
  }, [roomId]);

  // 자동 스크롤
  useEffect(() => {
    if (autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, autoScroll]);

  // 메시지 전송
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
      roomId, // ✅ roomId 사용
    };

    ws.current.send(JSON.stringify(payload));
    setMsg("");
  };

  // 초대 링크 생성
  const createInvite = async () => {
    try {
      const res = await axios.post(`/api/chat/rooms/${roomId}/invite`);
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
    <div className="chat-room">
      {/* 상단 헤더 */}
      <div className="chat-header">
        <h2>💬 {roomName || `채팅방 (${roomId})`}</h2>
        <div>
          <span className={isConnected ? "chat-connection" : "chat-disconnected"}>
            {isConnected ? "● 연결됨" : "● 끊김"}
          </span>
          <button onClick={createInvite}>🔗 초대</button>
        </div>
      </div>

      {/* 참여자 목록 */}
      <div className="chat-members-box">
        <b>참여자 ({members.length})</b>
        <div className="chat-members-list">
          {members.map((m, i) => (
            <span key={i} className="chat-member">
              • {m}
            </span>
          ))}
        </div>
      </div>

      {/* 메시지 리스트 */}
      <div
        className="chat-messages"
        ref={chatBoxRef}
        onScroll={handleScroll}
      >
        {messages.map((m, i) =>
          m.systemMessage ? (
            <div key={i} className="system-message">
              {m.message}
            </div>
          ) : (
            <div key={i}>
              <b>{m.sender}</b>: {m.message}{" "}
              <span style={{ fontSize: "0.8em" }}>({m.time})</span>
            </div>
          )
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 입력 영역 */}
      <div className="chat-input-wrapper">
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
          className="chat-textarea"
        />

        <button onClick={sendMessage} className="chat-send-btn">
          보내기
        </button>
      </div>

      {/* 초대 모달 */}
      {showModal && (
        <div className="invite-modal-bg" onClick={() => setShowModal(false)}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
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
