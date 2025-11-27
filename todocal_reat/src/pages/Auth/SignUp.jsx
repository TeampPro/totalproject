import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth/SignUp.css";
import Logo from "../../assets/logo.svg";
import backIcon from "../../assets/backIcon.svg";

function SignUp() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const [idChecked, setIdChecked] = useState(false); // 중복확인 했는지
  const [isIdAvailable, setIsIdAvailable] = useState(false); 

  const handleCheckId = async () => {
    if (!id.trim()) {
      alert("아이디를 먼저 입력해주세요.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/users/check-id?id=${encodeURIComponent(id)}`
      );

      if (!res.ok) {
        throw new Error("서버 오류");
      }

      const data = await res.json(); // { available: true/false }

      setIdChecked(true);
      setIsIdAvailable(data.available);

      if (data.available) {
        alert("사용 가능한 아이디입니다.");
      } else {
        alert("이미 사용 중인 아이디입니다.");
      }
    } catch (err) {
      console.error("아이디 중복확인 실패:", err);
      alert("중복확인 중 오류가 발생했습니다.");
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!id || !password || !passwordConfirm || !email || !name) {
      alert("모든 정보를 입력해주세요.");
      return;
    }
    if (password !== passwordConfirm) {
      alert("비밀번호와 비밀번호 확인이 일치하지 않습니다.");
      return;
    }
    if (!idChecked || !isIdAvailable) {
      alert("아이디 중복확인을 완료해주세요.");
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
          kakaoId: null,
          kakaoEmail: null,
        }),
      });

      const data = await response.json(); // 🔹 JSON 파싱

      if (response.ok) {
        alert(data.message || "회원가입이 완료되었습니다.");
        navigate("/login"); // ✅ 회원가입 후 로그인 화면으로 이동하고 싶으면 이렇게
      } else {
        alert(data.message || "회원가입에 실패했습니다.");
      }

    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        {/* 뒤로가기 */}
        <button
          type="button"
          className="signup-back-btn"
          onClick={() => navigate(-1)}
        >
          <img src={backIcon} alt="뒤로가기" className="signup-back-icon" />
        </button>

        {/* 로고 */}
        <img src={Logo} alt="Planix Logo" className="signup-logo" />

        <h2 className="signup-title">회원가입</h2>

        <form onSubmit={handleSubmit} className="signup-form">
          {/* 아이디 + 중복확인 */}
          <div className="signup-field signup-field-row">
            <div className="signup-field-main">
              <label className="signup-label">아이디</label>
              <input
                type="text"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setIdChecked(false);
                  setIsIdAvailable(false);
                }}
                placeholder="planix123"
                className="signup-input"
              />
            </div>

            <button
              type="button"
              className={`signup-check-btn ${
                idChecked && isIdAvailable ? "signup-check-btn--ok" : ""
              }`}
              onClick={handleCheckId}
            >
              {idChecked && isIdAvailable ? "사용 가능" : "중복확인"}
            </button>
          </div>

          {/* 비밀번호 */}
          <div className="signup-field">
            <label className="signup-label">비밀번호</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="비밀번호"
              className="signup-input"
            />
          </div>

          {/* 비밀번호 확인 */}
          <div className="signup-field">
            <label className="signup-label">비밀번호 확인</label>
            <input
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="비밀번호를 확인해주세요"
              className="signup-input"
            />
          </div>

          {/* 이름 */}
          <div className="signup-field">
            <label className="signup-label">이름</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="성함을 입력해주세요"
              className="signup-input"
            />
          </div>

          {/* 이메일 */}
          <div className="signup-field">
            <label className="signup-label">이메일</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="planix1234@test.com"
              className="signup-input"
            />
          </div>

          <button type="submit" className="signup-btn">
            Planix 시작하기
          </button>
        </form>

        <p className="signup-footer">
          이미 계정이 있으신가요?{" "}
          <span className="signup-link" onClick={() => navigate("/login")}>
            로그인
          </span>
        </p>
      </div>
    </div>
  );
}

export default SignUp;
