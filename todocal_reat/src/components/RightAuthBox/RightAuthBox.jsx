import React from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/RightAuthBox/RightAuthBox.css";
import Planix from "../../assets/planix1.svg";

const RightAuthBox = () => {
  const navigate = useNavigate();

  return (
    <div className="right-auth-wrapper">
      <div className="right-auth-box">
        <img src={Planix} alt="Planix Logo" className="planix-logo" />

        <button className="auth-login-btn" onClick={() => navigate("/login")}>
          로그인
        </button>

        <button className="auth-signup-btn" onClick={() => navigate("/signup")}>
          회원가입
        </button>
      </div>
    </div>
  );
};

export default RightAuthBox;
