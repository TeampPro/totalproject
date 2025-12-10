import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Auth/Login.css";
import west from "../../assets/west.svg"; // 뒤로가기 아이콘
import LogoHeader from "../../components/LogoHeader/LogoHeader.jsx";
import { apiFetch } from "../../api/http";

function Login({ setUser }) {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // Kakao SDK 로드
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://developers.kakao.com/sdk/js/kakao.js";
    script.async = true;
    script.onload = () => {
      if (window.Kakao && !window.Kakao.isInitialized()) {
        // 🔑 카카오 REST 키 (그대로 사용)
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
      const data = await apiFetch("/api/login", {
        method: "POST",
        body: JSON.stringify({ id, password }),
      });

      alert(data.message || "로그인 성공");

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      const userData = {
        id: data.id,
        name: data.name,
        nickname: data.nickname,
        userType: data.userType,
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));

      navigate("/main");
    } catch (error) {
      console.error("로그인 에러:", error);
      alert(error.message || "로그인 실패");
    }
  };

  // 비회원 회원가입 + 로그인
  const handleGuestSignup = async () => {
    try {
      const data = await apiFetch("/api/belogin", {
        method: "POST",
        body: JSON.stringify({}),
      });

      alert(
        `✅ ${data.message}\n\n아이디: ${data.id}\n비밀번호: ${data.password}`
      );

      localStorage.setItem(
        "guestInfo",
        JSON.stringify({ id: data.id, password: data.password })
      );

      const guestUser = {
        id: data.id,
        name: data.id,
        userType: data.userType || "guest",
      };

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      setUser(guestUser);
      localStorage.setItem("user", JSON.stringify(guestUser));

      navigate("/main");
    } catch (error) {
      console.error("비회원 로그인 에러:", error);
      alert(error.message || "비회원 회원가입에 실패했습니다.");
    }
  };

  // 카카오 로그인
  const handleKakaoLogin = () => {
    // 🔁 여기 redirect_uri 만 배포용 ngrok 백엔드 콜백으로 변경
    window.location.href =
      "https://kauth.kakao.com/oauth/authorize" +
      "?client_id=ea5df118a470f99f77bbff428c5d972e" +
      "&redirect_uri=https://overstraightly-nonverbalized-ciera.ngrok-free.dev/api/kakao/callback" +
      "&response_type=code" +
      "&prompt=login";
  };

  return (
    <div className="login-fullpage">
      {/* 좌측 상단 뒤로가기 버튼 */}
      <button
        type="button"
        className="login-back-button"
        onClick={() => navigate(-1)}
      >
        <img src={west} alt="뒤로가기" />
      </button>

      <LogoHeader />

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
              비회원 로그인
            </button>

            <button onClick={handleKakaoLogin} className="sub-btn kakao-btn">
              <img
                src="https://developers.kakao.com/assets/img/about/logos/kakaolink/kakaolink_btn_small.png"
                className="kakao-logo"
                alt="kakao-login"
              />
              카카오로 로그인
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
