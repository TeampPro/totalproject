import { useNavigate } from "react-router-dom";
import "../styles/Common/NotFound.css"; // CSS 파일 임포트

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="notfound-container">
      <h1 className="notfound-code">404</h1>
      <p className="notfound-message">페이지를 찾을 수 없습니다.</p>
      <button className="notfound-button" onClick={() => navigate("/")}>
        홈으로 돌아가기
      </button>
    </div>
  );
}
