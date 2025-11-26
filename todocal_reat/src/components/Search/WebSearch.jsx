// WebSearch.jsx
import { useState } from "react";
import { searchGoogle } from "../../api/searchApi";
import "../../styles/Search/WebSearch.css";

import searchLogo from "../../assets/searchLogo.svg";
import googleLogo from "../../assets/googleLogo.svg";
import googleText from "../../assets/googleText.svg";

function WebSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false); // 👈 추가

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await searchGoogle(query.trim());
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("검색 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="web-search-box">
      <form onSubmit={handleSubmit} className="web-search-form">
        <div className="web-search-inner">
          <img src={searchLogo} alt="검색" className="search-icon" />

          <div className="search-input-wrapper">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)} // 👈 포커스
              onBlur={() => setIsFocused(false)} // 👈 포커스 해제
              placeholder=" "
              className="search-input"
            />

            {/* 내용 없고, 포커스도 없을 때만 SVG 표시 */}
            {!query && !isFocused && (
              <img
                src={googleText}
                alt="Google 검색 또는 URL 입력"
                className="search-placeholder-img"
              />
            )}
          </div>

          <img src={googleLogo} alt="Google" className="google-logo" />

          <button type="submit" disabled={loading} className="hidden-submit">
            검색
          </button>
        </div>
      </form>
      {/* 결과 부분은 그대로 */}
    </div>
  );
}

export default WebSearch;
