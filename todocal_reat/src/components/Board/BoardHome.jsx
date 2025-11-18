import { useState, useEffect } from "react";
import axios from "axios";
import "./Board.css";

function BoardHome() {
  const [category, setCategory] = useState("free");
  const [posts, setPosts] = useState([]);

  const loadPosts = async () => {
    const res = await axios.get(
      `http://localhost:8080/api/posts?category=${category}`
    );
    setPosts(res.data);
  };

  useEffect(() => {
    loadPosts();
  }, [category]);

  return (
    <div className="board-container">
      <div className="board-top">
        <div className="board-tabs">
          <button onClick={() => setCategory("free")}>자유게시판</button>
          <button onClick={() => setCategory("notice")}>공지사항</button>
          <button onClick={() => setCategory("qna")}>Q&A</button>
        </div>

        <button className="write-btn">글쓰기</button>
      </div>

      <div className="post-list">
        {posts.map((p) => (
          <div key={p.id} className="post-item">
            <h4>{p.title}</h4>
            <p>{p.writer}</p>
            <span>{p.createdAt.slice(0, 10)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default BoardHome;
