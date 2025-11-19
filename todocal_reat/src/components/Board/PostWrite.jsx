import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import "../../styles/board/PostWrite.css";

const PostWrite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get("id"); // 수정 모드 여부

  const [category, setCategory] = useState("free");
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [writer, setWriter] = useState("tester"); // 로그인 연동하면 수정 가능

  // ⭐ 수정 모드일 경우 기존 글 불러오기
  useEffect(() => {
    if (!editId) return;

    const loadPost = async () => {
      const res = await axios.get(`http://localhost:8080/api/board/${editId}`);
      const p = res.data;

      setCategory(p.category);
      setTitle(p.title);
      setContent(p.content);
      setWriter(p.writer);
    };

    loadPost();
  }, [editId]);

  // ⭐ 저장
  const handleSave = async () => {
    if (!title.trim()) return alert("제목을 입력하세요!");
    if (!content.trim()) return alert("내용을 입력하세요!");

    const payload = { category, title, content, writer };

    try {
      if (editId) {
        // ⭐ 수정 모드 → PUT 실행
        await axios.put(`http://localhost:8080/api/board/${editId}`, payload);
        alert("수정되었습니다!");
        navigate(`/board/${editId}`);
      } else {
        // ⭐ 신규 작성 → POST 실행
        const res = await axios.post(
          `http://localhost:8080/api/board/create`,
          payload
        );
        alert("등록되었습니다!");
        navigate(`/board/${res.data.id}`);
      }
    } catch (err) {
      console.error(err);
      alert("저장 실패!");
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
