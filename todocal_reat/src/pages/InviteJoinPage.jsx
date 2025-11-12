import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * ✅ 초대 링크 클릭 시 자동 입장 페이지
 * 경로 예: /chat/invite/:code
 */
export default function InviteJoinPage() {
  const { code } = useParams(); // URL에서 초대 코드 추출
  const navigate = useNavigate();

  useEffect(() => {
    const joinRoom = async () => {
      try {
        // 사용자 이름 입력 (로그인 구현 전이면 임시 닉네임)
        let memberName = localStorage.getItem("memberName");
        if (!memberName) {
          memberName = prompt("닉네임을 입력하세요:");
          localStorage.setItem("memberName", memberName);
        }

        // ✅ 초대 참여 API 호출
        const res = await axios.post("/api/chat/invite/join", null, {
          params: { code, memberName },
        });

        // ✅ 성공 시 해당 방으로 이동
        alert(`'${res.data.name}' 방에 입장했습니다.`);
        navigate(`/chat/${res.data.id}`, { state: { memberName } });
      } catch (err) {
        console.error(err);
        alert("초대 코드가 유효하지 않거나 만료되었습니다.");
        navigate("/");
      }
    };

    joinRoom();
  }, [code, navigate]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <h2>🔗 초대 링크 확인 중...</h2>
      <p>잠시만 기다려주세요.</p>
    </div>
  );
}
