import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/Chat/InvitePage.css"

export default function InvitePage() {
  const navigate = useNavigate();
  const { code } = useParams();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const joinRoom = async () => {
    if (!name.trim()) {
      setError("이름을 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `/api/chat/invite/join?code=${code}&memberName=${name}`,
        { method: "POST" }
      );

      if (!res.ok) {
        throw new Error("초대 링크가 잘못되었거나 만료되었습니다.");
      }

      const data = await res.json();

      // 🔥 초대 참여자 이름 저장
      localStorage.setItem("memberName", name);

      // 채팅방으로 이동
      navigate(`/chat/${data.id}`, {
        state: { memberName: name },
      });
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="invite-container">
      <h2 className="invite-title">채팅방 초대</h2>
      <p className="invite-code">초대 코드: {code}</p>

      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="invite-input"
      />

      {error && <p className="invite-error">{error}</p>}

      <button className="invite-button" onClick={joinRoom}>
        입장하기
      </button>
    </div>
  );
}
