import { useEffect, useState } from "react";
import "../../styles/Auth/BeLogin.css";

function BeLogin() {
  const [guestInfo, setGuestInfo] = useState({ id: "", password: "" });

  useEffect(() => {
    const savedGuest = JSON.parse(localStorage.getItem("guestInfo"));
    if (savedGuest) {
      setGuestInfo(savedGuest);
    }
  }, []);

  return (
    <div className="be-container">
      <div className="be-card">
        <h2 className="be-title">비회원 로그인 완료 🎉</h2>

        {guestInfo.id ? (
          <>
            <p className="be-info">
              🆔 아이디: <b>{guestInfo.id}</b>
            </p>
            <p className="be-info">
              🔑 비밀번호: <b>{guestInfo.password}</b>
            </p>
            <p className="be-warning">
              ⚠️ 비회원 계정은 임시로 생성되며, 일부 기능이 제한됩니다.
            </p>
          </>
        ) : (
          <p className="be-loading">비회원 정보를 불러오는 중...</p>
        )}
      </div>
    </div>
  );
}

export default BeLogin;
