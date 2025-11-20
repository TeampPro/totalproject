import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/board/PostDetail.css";
import moment from "moment";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        const res = await axios.get(`http://localhost:8080/api/board/${id}`);
        setPost(res.data);
      } catch (err) {
        console.error("게시글 불러오기 실패:", err);
        alert("게시글을 불러오지 못했습니다.");
      }
    };
    loadPost();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/board/${id}`);
      alert("삭제되었습니다.");

      navigate("/main"); // 🔥 삭제 후 메인으로 이동 (게시판 목록 있는 곳)
    } catch (err) {
      console.error("삭제 실패", err);
      alert("삭제 중 오류 발생");
    }
  };

  if (!post) return <div className="post-detail-container">불러오는 중...</div>;

  return (
    <div className="post-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <h1 className="post-title">{post.title}</h1>

      <div className="post-meta">
        <span>작성자: {post.writer}</span>
        <span>작성일: {moment(post.createdAt).format("YYYY.MM.DD")}</span>
      </div>

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <button
          className="edit-btn"
          onClick={() => navigate(`/board/write?id=${post.id}`)}
        >
          수정
        </button>
        <button className="delete-btn" onClick={handleDelete}>
          삭제
        </button>
      </div>
    </div>
  );
};

export default PostDetail;
