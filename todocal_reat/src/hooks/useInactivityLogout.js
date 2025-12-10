import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const INACTIVITY_LIMIT = 30 * 60 * 1000; // 30분(ms)

export default function useInactivityLogout() {
  const navigate = useNavigate();

  useEffect(() => {
    let timerId = null;

    const startTimer = () => {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) return; // 로그인 안 되어 있으면 타이머 안 돌림

      if (timerId) clearTimeout(timerId);

      timerId = setTimeout(() => {
        const currentUser = JSON.parse(localStorage.getItem("user") || "null");
        if (!currentUser) return; // 이미 로그아웃 된 상태면 무시

        localStorage.removeItem("user"); // 클라이언트 로그아웃

        alert("30분 동안 사용이 없어 자동 로그아웃되었습니다.");

        // 홈으로 이동
        navigate("/main", { replace: true });
      }, INACTIVITY_LIMIT);
    };

    const resetTimer = () => {
      if (timerId) clearTimeout(timerId);
      startTimer();
    };

    const events = ["click", "mousemove", "keydown", "scroll", "touchstart"];

    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // 처음 진입 시 한 번 시작
    startTimer();

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      if (timerId) clearTimeout(timerId);
    };
  }, [navigate]);
}
