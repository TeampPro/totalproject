import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../styles/Board/PostWrite.css";

const PostWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id");

  // 🔥 로그인 유저 정보 불러오기
  const user = JSON.parse(localStorage.getItem("user"));
  const loginName =
    user?.nickname || // 🔥 닉네임이 있으면 무조건 이걸 사용
    user?.name || // 닉네임 없으면 이름
    user?.id || // 둘 다 없으면 아이디
    "익명";

  const loginUserType = user?.userType || "NORMAL"; // ★ ADMIN / NORMAL / guest 등

  const [category, setCategory] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  // ✔ writer 기본값을 로그인 사용자 이름으로 설정
  const [writer, setWriter] = useState(loginName);

  // ⭐ 수정 시 기존 데이터 불러오기
  useEffect(() => {
    if (!editId) return;

    const loadPost = async () => {
      const res = await axios.get(`http://localhost:8080/api/board/${editId}`);
      const p = res.data;

      setCategory(p.category);
      setTitle(p.title);
      setContent(p.content);
      setWriter(p.writer); // 기존 작성자 유지
    };

    loadPost();
  }, [editId]);

  // 저장 처리
  const handleSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!content.trim()) return alert("내용을 입력하세요!");

    if (
      (category === "notice" || category.toLowerCase() === "notice") &&
      loginUserType !== "ADMIN"
    ) {
      alert("공지사항은 관리자만 작성할 수 있습니다.");
      return;
    }

    const payload = { category, title, content, writer, userType: loginUserType };

    try {
      if (editId) {
        await axios.put(`http://localhost:8080/api/board/${editId}`, payload);
        alert("수정되었습니다!");
        navigate(`/board/${editId}`);
      } else {
        const res = await axios.post(
          `http://localhost:8080/api/board/create`,
          payload
        );
        alert("등록되었습니다!");
        navigate(`/board/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      // 백엔드에서 RuntimeException("공지사항은 관리자만...") 던지면 여기로 들어옴
      alert(err.response?.data?.message || "저장 실패!");
    }
  };

  return (
    <div className="post-write-container">
      <h2>{editId ? "게시글 수정" : "새 글 작성"}</h2>

      <label>카테고리</label>
      <select value={category} onChange={(e) => setCategory(e.target.value)}>
        <option value="free">자유게시판</option>
        <option value="notice">공지사항</option>
        <option value="qna">Q&A</option>
      </select>

      <label>제목</label>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <label>내용</label>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
      ></textarea>

      <div className="write-actions">
        <button onClick={() => navigate(-1)}>취소</button>
        <button onClick={handleSave}>{editId ? "수정" : "등록"}</button>
      </div>
    </div>
  );
};

export default PostWrite;
