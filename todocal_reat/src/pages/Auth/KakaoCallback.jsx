import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

function KakaoCallback({ setUser }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get("id");
    const token = params.get("token");

    if (!id) {
      alert("카카오 로그인 정보가 올바르지 않습니다. 다시 시도해주세요.");
      navigate("/login", { replace: true });
      return;
    }

    // ✅ 우리 서비스에서 사용하는 user 객체 형태 맞추기
    const kakaoUser = {
      id,                  // "kakao_..." 형태
      name: "",            // 상세 정보는 마이페이지/프로필에서 별도 API로 가져옴
      email: "",
      nickname: "",
      userType: "KAKAO",
    };

    // 1️⃣ localStorage 저장
    localStorage.setItem("user", JSON.stringify(kakaoUser));
    localStorage.setItem("token", token);

    // 2️⃣ App.jsx 의 user 상태 갱신
    setUser(kakaoUser);

    // 3️⃣ 메인 페이지로 이동
    navigate("/main", { replace: true });
  }, [location, navigate, setUser]);

  return (
    <div style={{ padding: "40px", textAlign: "center" }}>
      카카오 로그인 처리 중입니다...
    </div>
  );
}

export default KakaoCallback;
