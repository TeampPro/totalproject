import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/board/PostDetail.css";
import moment from "moment";

const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);

  // 댓글 상태
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  // 수정 상태
  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  // 대댓글 상태
  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  /** ======================
   *  게시글 불러오기
   ====================== */
  const loadPost = async () => {
    const res = await axios.get(`http://localhost:8080/api/board/${id}`);
    setPost(res.data);
  };

  /** ======================
   *  댓글 불러오기
   ====================== */
  const loadComments = async () => {
    const res = await axios.get(`http://localhost:8080/api/comments/${id}`);
    setComments(res.data); // parentId 포함된 flat 구조
  };

  /** ======================
   *  최초 로드
   ====================== */
  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  /** ======================
   *  댓글 등록
   ====================== */
  const handleAddComment = async () => {
    if (!newComment.trim()) return alert("댓글을 입력해주세요.");

    await axios.post(`http://localhost:8080/api/comments/${id}`, {
      writer: "익명",
      content: newComment,
      parentId: null,
    });

    setNewComment("");
    loadComments();
  };

  /** ======================
   *  대댓글 등록
   ====================== */
  const handleAddReply = async (parentId) => {
    if (!replyContent.trim()) return alert("답글을 입력해주세요.");

    await axios.post(`http://localhost:8080/api/comments/${id}`, {
      writer: "익명",
      content: replyContent,
      parentId: parentId,
    });

    setReplyToId(null);
    setReplyContent("");
    loadComments();
  };

  /** ======================
   *  댓글 수정
   ====================== */
  const handleEdit = async (cid) => {
    if (!editContent.trim()) return alert("내용을 입력해주세요.");

    try {
      await axios.put(`http://localhost:8080/api/comments/${cid}`, {
        content: editContent,
      });

      setEditingId(null);
      setEditContent("");

      await loadComments(); // 🔥 반드시 새로고침 필요
    } catch (err) {
      console.error("댓글 수정 실패:", err);
      alert("댓글 수정 중 오류가 발생했습니다.");
    }
  };

  /** ======================
   *  댓글 삭제
   ====================== */
  const handleDeleteComment = async (cid) => {
    if (!window.confirm("댓글을 삭제하시겠습니까?")) return;

    await axios.delete(`http://localhost:8080/api/comments/${cid}`);
    loadComments();
  };

  /** ======================
   *  게시글 삭제
   ====================== */
  const handleDeletePost = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    await axios.delete(`http://localhost:8080/api/board/${id}`);
    alert("삭제되었습니다.");
    navigate("/main");
  };

  if (!post) return <div className="post-detail-container">불러오는 중...</div>;

  /** ======================
   *  댓글 → 트리 구조 변환
   ====================== */
  const buildTree = (items) => {
    const map = {};
    items.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });

    const roots = [];
    items.forEach((c) => {
      if (c.parentId) {
        map[c.parentId].children.push(map[c.id]);
      } else {
        roots.push(map[c.id]);
      }
    });

    return roots;
  };

  const commentTree = buildTree(comments);

  /** ======================
   *  재귀 렌더링
   ====================== */
  const CommentNode = ({ node, depth = 0 }) => {
    const isEditing = editingId === node.id;
    const isReplying = replyToId === node.id;

    return (
      <div
        className="comment-item"
        style={{ marginLeft: depth * 20 }} // 들여쓰기
      >
        {isEditing ? (
          <>
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <div className="comment-actions">
              <button onClick={() => handleEdit(node.id)}>저장</button>
              <button onClick={() => setEditingId(null)}>취소</button>
            </div>
          </>
        ) : (
          <>
            <div className="comment-content">{node.content}</div>

            <div className="comment-meta">
              <span>{node.writer}</span>
              <span>{moment(node.createdAt).format("YYYY.MM.DD HH:mm")}</span>
            </div>

            <div className="comment-actions">
              <button
                onClick={() => {
                  setEditingId(node.id);
                  setEditContent(node.content);
                }}
              >
                수정
              </button>
              <button onClick={() => handleDeleteComment(node.id)}>삭제</button>
              <button
                onClick={() => {
                  setReplyToId(node.id);
                  setReplyContent("");
                }}
              >
                답글
              </button>
            </div>

            {isReplying && (
              <div className="reply-form">
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 입력하세요"
                />
                <button onClick={() => handleAddReply(node.id)}>등록</button>
                <button onClick={() => setReplyToId(null)}>취소</button>
              </div>
            )}
          </>
        )}

        {/* 하위 댓글 */}
        {node.children.map((child) => (
          <CommentNode key={child.id} node={child} depth={depth + 1} />
        ))}
      </div>
    );
  };

  /** ======================
   *  렌더링
   ====================== */
  return (
    <div className="post-detail-container">
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← 뒤로가기
      </button>

      <h1 className="post-title">{post.title}</h1>

      <div className="post-meta">
        <span>작성자: {post.writer}</span>
        <span>{moment(post.createdAt).format("YYYY.MM.DD HH:mm")}</span>
      </div>

      <div className="post-content">{post.content}</div>

      <div className="post-actions">
        <button
          className="edit-btn"
          onClick={() => navigate(`/board/write?id=${post.id}`)}
        >
          수정
        </button>
        <button className="delete-btn" onClick={handleDeletePost}>
          삭제
        </button>
      </div>

      <h3 className="comment-title">댓글</h3>

      <div className="comment-form">
        <textarea
          placeholder="댓글을 입력하세요"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button className="comment-submit" onClick={handleAddComment}>
          등록
        </button>
      </div>

      <div className="comment-list">
        {commentTree.map((node) => (
          <CommentNode key={node.id} node={node} />
        ))}
      </div>
    </div>
  );
};

export default PostDetail;
