import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import "../../styles/board/Board.css";

const CATEGORY_TABS = [
  { key: "free", label: "자유게시판" },
  { key: "notice", label: "공지사항" },
  { key: "qna", label: "Q&A" },
];

const ITEMS_PER_PAGE = 10; // 🔥 페이지 당 10개

const BoardHome = () => {
  const [category, setCategory] = useState("free");
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1); // 🔥 페이지 상태

  const navigate = useNavigate();

  const loadPosts = async (cat) => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get(
        `http://localhost:8080/api/board/list/${cat}`
      );
      setPosts(res.data);
      setCurrentPage(1); // 카테고리 바뀌면 첫 페이지로
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

  // 날짜 포맷
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("YYYY. MM. DD.");
  };

  // 🔥 공지 맨 위 + 최신순 정렬
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.notice && !b.notice) return -1;
    if (!a.notice && b.notice) return 1;
    return b.id - a.id;
  });

  // 🔥 페이지용 posts slice
  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIdx, startIdx + ITEMS_PER_PAGE);

  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  return (
    <div className="board-container">
      {/* 상단 탭 + 글쓰기 */}
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
              {/* 제목 영역 */}
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

              {/* 작성자 */}
              <div className="col-writer">{post.writer}</div>

              {/* 작성일 */}
              <div className="col-date">{formatDate(post.createdAt)}</div>

              {/* 조회수 */}
              <div className="col-views">{post.views}</div>
            </div>
          ))}
      </div>

      {/* 🔥 페이지네이션 */}
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
