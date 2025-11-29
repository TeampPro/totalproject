import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import moment from "moment";
import "../../styles/Board/Board.css";

// 상단바
import TopBar from "../../components/TopBar/TopBar.jsx";

// 아이콘들
import PlusIcon from "../../assets/plusIcon.svg";
import SearchIcon from "../../assets/search2.svg";
import NoticeIcon from "../../assets/circle_notifications.svg";      // 큰 공지 아이콘
import NoticePostIcon from "../../assets/circle_notifications2.svg"; // 공지 게시글용 아이콘
import ArrowLeftIcon from "../../assets/keyboard_arrow_left.svg";
import ArrowRightIcon from "../../assets/keyboard_arrow_right.svg";

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

  // 공지사항 전용 상태
  const [noticePosts, setNoticePosts] = useState([]);

  // 검색 UI 상태
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchField, setSearchField] = useState("title");
  const [searchFieldLabel, setSearchFieldLabel] = useState("제목");
  const [searchValue, setSearchValue] = useState("");

  const navigate = useNavigate();

  // 로그인 유저 정보 (공지 권한 체크용)
  const savedUser = JSON.parse(localStorage.getItem("user"));
  const loginUserType = savedUser?.userType || "NORMAL"; // ADMIN / NORMAL / guest 등

  // 검색 기준 선택
  const selectField = (field, label) => {
    setSearchField(field);
    setSearchFieldLabel(label);
    setShowDropdown(false);

    setSearchValue("");
  };

  // 검색
  const handleSearch = async () => {
    try {
      const params = {
        category,
        field: searchField,
        keyword: searchValue,
      };

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

  // 게시글 리스트 불러오기 (현재 카테고리)
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

  // 카테고리 변경 시 게시글 로드
  useEffect(() => {
    loadPosts(category);
  }, [category]);

  // 공지사항 목록 (공지 카테고리) 별도 로드
  useEffect(() => {
    const loadNoticePosts = async () => {
      try {
        const res = await axios.get(
          "http://localhost:8080/api/board/list/notice"
        );
        setNoticePosts(res.data);
      } catch (err) {
        console.error("공지사항 목록 불러오기 실패:", err);
      }
    };

    loadNoticePosts();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return moment(dateString).format("YYYY. MM. DD.");
  };

  // 공지 우선 + 최신순
  const sortedPosts = [...posts].sort((a, b) => {
    if (a.notice && !b.notice) return -1;
    if (!a.notice && b.notice) return 1;
    return b.id - a.id;
  });

  // 공지 카테고리 전체 최신순
  const sortedNoticePosts = [...noticePosts].sort((a, b) => b.id - a.id);

  const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentPosts = sortedPosts.slice(startIdx, startIdx + ITEMS_PER_PAGE);
  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  // 글쓰기 버튼
  const handleClickWrite = () => {
    if (
      (category === "notice" || category.toLowerCase() === "notice") &&
      loginUserType !== "ADMIN"
    ) {
      alert("공지사항은 관리자만 작성할 수 있습니다.");
      return;
    }
    navigate(`/board/write?category=${category}`);
  };

  return (
    <div className="board-page">
      {/* 상단 공통 TopBar */}
      <TopBar
        showBackButton={true}
        onMenuClick={() => {}}
        onProfileClick={() => {}}
      />

      {/* 게시판 메인 컨테이너 */}
      <div className="board-container">
        {/* 상단 탭 + 글쓰기 버튼 */}
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

          {(category !== "notice" || loginUserType === "ADMIN") && (
            <button className="board-write-btn" onClick={handleClickWrite}>
              <img src={PlusIcon} alt="글쓰기" className="write-icon" />
              <span>게시글 작성하기</span>
            </button>
          )}
        </div>

        {/* 검색 바 */}
        <div className="board-search-row">
          <div className="search-box">
            <div
              className="search-select"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              {searchFieldLabel} ▼
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
                    <div onClick={() => selectField("content", "내용")}>
                      내용
                    </div>
                  )}
                </div>
              )}
            </div>

            <input
              type="text"
              placeholder="검색어를 입력해주세요"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              className="search-input"
            />

            <button className="search-btn" onClick={handleSearch}>
              <img src={SearchIcon} alt="검색" />
            </button>
          </div>
        </div>

        {/* 공지사항 영역 (자유/Q&A 탭에서만 노출) */}
        {category !== "notice" && sortedNoticePosts.length > 0 && (
          <div className="board-notice-wrapper">
            {/* 공지사항 타이틀 */}
            <div className="notice-title-row">
              <div className="notice-title-left">
                <img
                  src={NoticeIcon}
                  alt="공지 아이콘"
                  className="notice-main-icon"
                />
                <span className="notice-title-text">공지사항</span>
              </div>
            </div>

            {/* 공지 카드 리스트 */}
            <div className="notice-list">
              {sortedNoticePosts.map((post) => (
                <div
                  key={post.id}
                  className="notice-card"
                  onClick={() => navigate(`/board/${post.id}`)}
                >
                  <div className="notice-card-left">
                    <img
                      src={NoticePostIcon}
                      alt="공지"
                      className="notice-post-icon"
                    />
                    <span className="notice-card-title">{post.title}</span>
                    {post.commentCount > 0 && (
                      <span className="notice-comment-count">
                        [{post.commentCount}]
                      </span>
                    )}
                  </div>

                  <div className="notice-card-right">
                    <span className="notice-writer">{post.writer}</span>
                    <span className="notice-date">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 공지와 일반 글 사이 구분선 */}
            <div className="board-divider" />
          </div>
        )}

        {/* 일반 게시글 리스트 */}
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
                    className={`post-prefix ${
                      post.notice ? "notice-text" : ""
                    }`}
                  >
                    {post.notice ? "●" : "•"}
                  </span>

                  {/* ✅ 리스트 안의 글 제목은 전부 같은(일반) 폰트 */}
                  <span className="post-title post-title-normal">
                    {post.title}
                  </span>

                  {post.commentCount > 0 && (
                    <span className="comment-count">
                      [{post.commentCount}]
                    </span>
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
              className="page-arrow"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
            >
              <img src={ArrowLeftIcon} alt="이전 페이지" />
            </button>

            <span className="page-number">{currentPage}</span>

            <button
              className="page-arrow"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              <img src={ArrowRightIcon} alt="다음 페이지" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BoardHome;
