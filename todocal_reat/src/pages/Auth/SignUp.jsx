import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth/SignUp.css";

function SignUp() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [kakaoId, setKakaoId] = useState("");
  const [kakaoEmail, setKakaoEmail] = useState("");
  const [useKakaoId, setUseKakaoId] = useState(false);
  const [useKakaoEmail, setUseKakaoEmail] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !password || !email || !name) {
      alert("모든 기본 정보를 입력해주세요.");
      return;
    }
    if (!useKakaoId && !useKakaoEmail) {
      alert("카카오 ID 또는 카카오 Email 중 하나를 선택해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id,
          password,
          email,
          name,
          kakaoId: useKakaoId ? kakaoId : null,
          kakaoEmail: useKakaoEmail ? kakaoEmail : null,
        }),
      });

      const data = await response.text();
      if (response.ok) {
        alert(data);
        navigate("/");
      } else {
        alert(data);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <h2 className="signup-title">회원가입</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            className="signup-input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="signup-input"
          />

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="이메일"
            className="signup-input"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="이름"
            className="signup-input"
          />

          <div className="kakao-section">
            <label>
              <input
                type="checkbox"
                checked={useKakaoId}
                onChange={(e) => setUseKakaoId(e.target.checked)}
              />
              카카오 ID 사용
            </label>

            {useKakaoId && (
              <input
                type="text"
                value={kakaoId}
                onChange={(e) => setKakaoId(e.target.value)}
                placeholder="카카오 ID 입력"
                className="signup-input"
              />
            )}

            <label>
              <input
                type="checkbox"
                checked={useKakaoEmail}
                onChange={(e) => setUseKakaoEmail(e.target.checked)}
              />
              카카오 이메일 사용
            </label>

            {useKakaoEmail && (
              <input
                type="email"
                value={kakaoEmail}
                onChange={(e) => setKakaoEmail(e.target.value)}
                placeholder="카카오 이메일 입력"
                className="signup-input"
              />
            )}
          </div>

          <button type="submit" className="signup-btn">
            회원가입
          </button>
        </form>

        <p className="signup-footer">
          이미 계정이 있으신가요?{" "}
          <span className="signup-link" onClick={() => navigate("/")}>
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
