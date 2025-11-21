import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import "../../styles/Board/Board.css";

const CATEGORY_TABS = [
  { key: "free", label: "자유게시판" },
  { key: "notice", label: "공지사항" },
  { key: "qna", label: "Q&A" },
];

const ITEMS_PER_PAGE = 10;

const BoardHome = () => {
  const [category, setCategory] = useState("free");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // 🔽 검색 UI 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchField, setSearchField] = useState("title");
  const [searchFieldLabel, setSearchFieldLabel] = useState("제목");

  const [searchValue, setSearchValue] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const navigate = useNavigate();

  /** 🔽 검색 기준 선택 시 실행 */
  const selectField = (field, label) => {
    setSearchField(field);
    setSearchFieldLabel(label);
    setShowDropdown(false);

    setSearchValue("");
    setStartDate("");
    setEndDate("");
  };

  /** 🔍 검색 요청 */
  const handleSearch = async () => {
    try {
      const params = { category };

      if (searchField === "date") {
        params.startDate = startDate;
        params.endDate = endDate;
      } else {
        params.field = searchField;
        params.keyword = searchValue;
      }

      const res = await axios.get("http://localhost:8080/api/board/search", {
        params,
      });

      setPosts(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("검색 실패:", err);
      alert("검색 중 오류 발생");
    }
  };

  /** 게시글 리스트 불러오기 */
  const loadPosts = async (cat) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `http://localhost:8080/api/board/list/${cat}`
      );
      setPosts(res.data);
      setCurrentPage(1);
    } catch (err) {
      console.error("게시글 목록 불러오기 실패:", err);
      setError("게시글을 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts(category);
  }, [category]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("YYYY. MM. DD.");
  };

  /** 🔽 공지 → 최상단 + 최신순 */
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.notice && !b.notice) return -1;
    if (!a.notice && b.notice) return 1;
    return b.id - a.id;
  });

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  return (
    <div className="board-container">
      <div className="board-top">
        <div className="board-tabs">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.key}
              className={`board-tab ${category === tab.key ? "active" : ""}`}
              onClick={() => setCategory(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* 🔍 검색 UI */}
        <div className="search-box" style={{ position: "relative" }}>
          {/* 검색 기준 선택 */}
          <div
            className="search-select"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            {searchFieldLabel} ▼
          </div>

          {showDropdown && (
            <div className="search-dropdown">
              {searchField !== "title" && (
                <div onClick={() => selectField("title", "제목")}>제목</div>
              )}
              {searchField !== "writer" && (
                <div onClick={() => selectField("writer", "작성자")}>
                  작성자
                </div>
              )}
              {searchField !== "content" && (
                <div onClick={() => selectField("content", "내용")}>내용</div>
              )}
              {searchField !== "date" && (
                <div onClick={() => selectField("date", "작성일")}>작성일</div>
              )}
            </div>
          )}

          {/* 검색 input */}
          {searchField !== "date" ? (
            <input
              type="text"
              placeholder="검색어 입력"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />
          ) : (
            <div className="date-box">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              <span> ~ </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
          )}

          <button className="search-btn" onClick={handleSearch}>
            검색
          </button>
        </div>

        <button
          className="board-write-btn"
          onClick={() => navigate("/board/write")}
        >
          글쓰기
        </button>
      </div>

      {/* 리스트 */}
      <div className="board-header">
        <span className="col-title">제목</span>
        <span className="col-writer">작성자</span>
        <span className="col-date">작성일</span>
        <span className="col-views">조회수</span>
      </div>

      <div className="board-list">
        {loading && <div className="board-info">불러오는 중...</div>}
        {error && <div className="board-error">{error}</div>}
        {!loading && !error && currentPosts.length === 0 && (
          <div className="board-empty">등록된 게시글이 없습니다.</div>
        )}

        {!loading &&
          !error &&
          currentPosts.map((post) => (
            <div
              key={post.id}
              className={`board-row ${post.notice ? "notice" : ""}`}
              onClick={() => navigate(`/board/${post.id}`)}
            >
              <div className="col-title">
                <span
                  className={`post-prefix ${post.notice ? "notice-text" : ""}`}
                >
                  {post.notice ? "[공지]" : "•"}
                </span>

                <span className="post-title">{post.title}</span>

                {post.commentCount > 0 && (
                  <span className="comment-count">[{post.commentCount}]</span>
                )}
              </div>

              <div className="col-writer">{post.writer}</div>
              <div className="col-date">{formatDate(post.createdAt)}</div>
              <div className="col-views">{post.views}</div>
            </div>
          ))}
      </div>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            이전
          </button>

          <span className="page-number">
            {currentPage} / {totalPages}
          </span>

          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default BoardHome;
