import { useState } from "react";
import { searchGoogle } from "../../api/searchApi";
import "../../styles/Search/WebSearch.css";

function WebSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!query.trim()) return;

    setLoading(true);
    setError("");
    setResults([]);

    try {
      const data = await searchGoogle(query.trim());
      setResults(data.results || []);
    } catch (err) {
      console.error(err);
      setError("검색중 오류가 발생했습니다.")
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="web-search-box">
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Google 웹 검색"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "60%", marginRight: "0.5rem" }}
        />
        <button type="submit" disabled={loading}>
          {loading ? "검색 중..." : "검색"}
        </button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {results.length > 0 && (
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {results.map((item, idx) => (
            <li key={idx} style={{ marginBottom: "0.75rem" }}>
              <a href={item.link} target="_blank" rel="noreferrer">
                <strong>{item.title}</strong>
              </a>
              <div style={{ fontSize: "0.9rem" }}>{item.snippet}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default WebSearch;