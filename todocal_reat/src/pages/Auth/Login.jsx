import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth/Login.css";

function Login() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Kakao SDK 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (!window.Kakao.isInitialized()) {
        window.Kakao.init("ea5df118a470f99f77bbff428c5d972e");
      }
    };
    document.body.appendChild(script);
  }, []);

  // 일반 로그인
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!id || !password) {
      alert("아이디와 비밀번호를 모두 입력해주세요.");
      return;
    }

    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || "로그인 성공");

        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            name: data.name,
            email: data.email,
            nickname: data.nickname,
            userType: data.userType || "member",
          })
        );

        navigate("/main");
      } else {
        alert(data.message || "로그인 실패");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  // 비회원 회원가입
  const handleGuestSignup = async () => {
    try {
      const response = await fetch("http://localhost:8080/api/belogin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (response.ok) {
        alert(
          `✅ ${data.message}\n\n아이디: ${data.id}\n비밀번호: ${data.password}`
        );

        localStorage.setItem(
          "guestInfo",
          JSON.stringify({ id: data.id, password: data.password })
        );
        localStorage.setItem(
          "user",
          JSON.stringify({
            id: data.id,
            name: data.id,
            userType: data.userType || "guest",
          })
        );

        localStorage.setItem("memberName", data.id);

        navigate("/main");
      } else {
        alert(data.message || "비회원 회원가입에 실패했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      alert("서버 연결에 실패했습니다.");
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = () => {
    window.location.href =
      "https://kauth.kakao.com/oauth/authorize?client_id=ea5df118a470f99f77bbff428c5d972e&redirect_uri=http://localhost:8080/api/kakao/callback&response_type=code";
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2 className="login-title">로그인</h2>

        <form onSubmit={handleSubmit} className="login-form">
          <input
            type="text"
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="아이디"
            className="login-input"
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="비밀번호"
            className="login-input"
          />

          <button type="submit" className="login-btn">
            로그인
          </button>
        </form>

        <p className="login-footer">
          계정이 없으신가요?{" "}
          <span className="login-link" onClick={() => navigate("/signup")}>
            회원가입
          </span>
        </p>

        <div className="login-bottom-buttons">
          <button onClick={handleGuestSignup} className="sub-btn">
            비회원 회원가입
          </button>

          <button onClick={handleKakaoLogin} className="sub-btn kakao-btn">
            <img
              src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
              alt="Kakao Logo"
              className="kakao-logo"
            />
            카카오로 로그인
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;
