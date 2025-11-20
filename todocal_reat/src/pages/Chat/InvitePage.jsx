import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function InvitePage() {
  const navigate = useNavigate();
  const { code } = useParams(); // /chat/invite/:code 에서 초대코드 가져옴

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
      console.log("초대 응답 데이터:", data);

      // 🔥 여기 추가
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
    <div style={styles.container}>
      <h2 style={styles.title}>채팅방 초대</h2>
      <p style={styles.codeBox}>초대 코드: {code}</p>

      <input
        type="text"
        placeholder="닉네임을 입력하세요"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={styles.input}
      />

      {error && <p style={styles.error}>{error}</p>}

      <button style={styles.button} onClick={joinRoom}>
        입장하기
      </button>
    </div>
  );
}

const styles = {
  container: {
    padding: "40px",
    textAlign: "center",
  },
  title: {
    fontSize: "24px",
    marginBottom: "20px",
  },
  codeBox: {
    background: "#eee",
    padding: "10px",
    borderRadius: "6px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    width: "250px",
    marginBottom: "10px",
  },
  button: {
    padding: "10px 20px",
    background: "#007bff",
    color: "#fff",
    border: "none",
    cursor: "pointer",
  },
  error: {
    color: "red",
    marginTop: "5px",
  },
};
