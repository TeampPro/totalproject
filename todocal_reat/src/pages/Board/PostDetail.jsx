import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../../api/setupAxios";
import "../../styles/board/PostDetail.css";
import moment from "moment";
import list from "../../assets/commentList.svg";
import modify from "../../assets/modify.svg";

/** ======================
 *  대댓글 재귀 컴포넌트
 ====================== */
const CommentNode = React.memo(function CommentNode({
  node,
  depth = 0,
  editingId,
  editContent,
  replyToId,
  replyContent,
  onChangeEditContent,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onDelete,
  onStartReply,
  onChangeReplyContent,
  onSaveReply,
  onCancelReply,
  loginNickname,
  loginUserType,
}) {
  const isEditing = editingId === node.id;
  const isReplying = replyToId === node.id;
  const isAdmin = loginUserType === "ADMIN";

  return (
    <div className="comment-item" style={{ marginLeft: depth * 20 }}>
      {isEditing ? (
        /* 🔥 수정 모드: 일반 댓글창처럼 */
        <div className="inline-edit-form">
          <textarea
            className="inline-edit-textarea"
            value={editContent}
            onChange={(e) => onChangeEditContent(e.target.value)}
            placeholder="댓글을 수정하세요."
          />
          <div className="inline-edit-actions">
            <button
              className="comment-btn-primary"
              onClick={() => onSaveEdit(node.id)}
            >
              저장
            </button>
            <button className="comment-btn-secondary" onClick={onCancelEdit}>
              취소
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* 🔥 이름 · 내용 · 시간을 한 줄에 배치 */}
          <div className="comment-row">
            <span className="comment-writer">{node.writer}</span>
            <span className="comment-text">{node.content}</span>
            <span className="comment-time">
              {moment(node.createdAt).format("YYYY.MM.DD HH:mm")}
            </span>
          </div>

          <div className="comment-actions">
            {node.writer === loginNickname && (
              <button onClick={() => onStartEdit(node)}>수정</button>
            )}

            {(node.writer === loginNickname || isAdmin) && (
              <button onClick={() => onDelete(node.id)}>삭제</button>
            )}

            <button onClick={() => onStartReply(node.id)}>답글</button>
          </div>

          {/* 🔥 답글 입력창도 일반 댓글창처럼 */}
          {isReplying && (
            <div className="reply-form">
              <textarea
                value={replyContent}
                onChange={(e) => onChangeReplyContent(e.target.value)}
                placeholder="답글을 입력하세요."
              />
              <div className="reply-actions">
                <button
                  className="comment-btn-primary"
                  onClick={() => onSaveReply(node.id)}
                >
                  등록
                </button>
                <button
                  className="comment-btn-secondary"
                  onClick={onCancelReply}
                >
                  취소
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {node.children.map((child) => (
        <CommentNode
          key={child.id}
          node={child}
          depth={depth + 1}
          editingId={editingId}
          editContent={editContent}
          replyToId={replyToId}
          replyContent={replyContent}
          onChangeEditContent={onChangeEditContent}
          onStartEdit={onStartEdit}
          onSaveEdit={onSaveEdit}
          onCancelEdit={onCancelEdit}
          onDelete={onDelete}
          onStartReply={onStartReply}
          onChangeReplyContent={onChangeReplyContent}
          onSaveReply={onSaveReply}
          onCancelReply={onCancelReply}
          loginNickname={loginNickname}
          loginUserType={loginUserType}
        />
      ))}
    </div>
  );
});

/** ======================
 *  게시글 상세
 ====================== */
const PostDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const savedUser = JSON.parse(localStorage.getItem("user"));
  const loginNickname =
    savedUser?.nickname || savedUser?.name || savedUser?.id || "익명";
  const loginUserType = savedUser?.userType || "NORMAL";
  const isAdmin = loginUserType === "ADMIN";

  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);

  const [newComment, setNewComment] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editContent, setEditContent] = useState("");

  const [replyToId, setReplyToId] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  /** 게시글 불러오기 */
  const loadPost = async () => {
    try {
      const res = await axios.get(`/api/board/${id}`);
      setPost(res.data);
    } catch (err) {
      alert("게시글을 불러오는 중 오류 발생");
    }
  };

  /** 댓글 불러오기 */
  const loadComments = async () => {
    try {
      const res = await axios.get(`/api/comments/${id}`);
      setComments(res.data);
    } catch (err) {
      // 필요 시 에러 처리
    }
  };

  /** 이전글 이동 */
  const goPrev = async () => {
    const res = await axios.get(`/api/board/${id}/prev`);
    if (res.data?.id) navigate(`/board/${res.data.id}`);
    else alert("이전 글이 없습니다.");
  };

  /** 다음글 이동 */
  const goNext = async () => {
    const res = await axios.get(`/api/board/${id}/next`);
    if (res.data?.id) navigate(`/board/${res.data.id}`);
    else alert("다음 글이 없습니다.");
  };

  useEffect(() => {
    loadPost();
    loadComments();
  }, [id]);

  /** 댓글 등록 */
  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    await axios.post(`/api/comments/${id}`, {
      writer: loginNickname,
      content: newComment,
      parentId: null,
    });

    setNewComment("");
    loadComments();
  };

  /** 대댓글 등록 */
  const handleAddReply = async (parentId) => {
    if (!replyContent.trim()) return;

    await axios.post(`/api/comments/${id}`, {
      writer: loginNickname,
      content: replyContent,
      parentId,
    });

    setReplyContent("");
    setReplyToId(null);
    loadComments();
  };

  /** 댓글 삭제 */
  const handleDeleteComment = async (cid) => {
    await axios.delete(`/api/comments/${cid}`, {
      data: {
        writer: loginNickname,
        userType: loginUserType,
      },
    });
    loadComments();
  };

  /** 댓글 수정 */
  const handleEdit = async (cid) => {
    await axios.put(`/api/comments/${cid}`, {
      content: editContent,
      writer: loginNickname,
    });

    setEditingId(null);
    loadComments();
  };

  /** 게시글 삭제 */
  const handleDeletePost = async () => {
    const ok = window.confirm("정말 이 게시글을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      await axios.delete(`/api/board/${id}`, {
        data: {
          writer: loginNickname,
          userType: loginUserType,
        },
      });

      alert("게시글이 삭제되었습니다.");
      // 삭제 후 게시글 목록으로 이동
      navigate("/board");
    } catch (err) {
      console.error(err);
      alert("게시글 삭제 중 오류가 발생했습니다.");
    }
  };

  if (!post) return <div>로딩중...</div>;

  /** 댓글 트리 구성 */
  const buildTree = (items) => {
    const map = {};
    items.forEach((c) => {
      map[c.id] = { ...c, children: [] };
    });

    const roots = [];
    items.forEach((c) => {
      if (c.parentId) map[c.parentId]?.children.push(map[c.id]);
      else roots.push(map[c.id]);
    });

    return roots;
  };

  const commentTree = buildTree(comments);

  return (
    <div className="post-detail-container">
      {/* 상단 우측 X 버튼 = 삭제 버튼 */}
      <button
        type="button"
        className="close-btn"
        onClick={handleDeletePost}
        aria-label="게시글 삭제"
      />

      {/* 제목 */}
      <h1 className="post-title">{post.title}</h1>

      {/* 작성자 / 날짜 */}
      <div className="post-meta">
        <span className="meta-label">닉네임</span>
        <span className="meta-writer">{post.writer}</span>
        <span className="meta-date">
          {moment(post.createdAt).format("YYYY.MM.DD HH:mm")}
        </span>
      </div>

      {/* 본문 + 수정하기 버튼 */}
      <div className="post-content-wrapper">
        <div className="post-content">{post.content}</div>

        {post.writer === loginNickname && (
          <button
            className="post-edit-inline"
            type="button"
            onClick={() => navigate(`/board/write?id=${post.id}`)}
          >
            <img
              src={modify}
              alt="수정 아이콘"
              className="modify-icon-inline"
            />
            수정하기
          </button>
        )}
      </div>

      {/* 댓글 타이틀 */}
      <h3 className="comment-title">Comment</h3>

      {/* ✅ 댓글 리스트: 기존 댓글 먼저 보여주기 */}
      <div className="comment-list">
        {commentTree.map((node) => (
          <CommentNode
            key={node.id}
            node={node}
            depth={0}
            editingId={editingId}
            editContent={editContent}
            replyToId={replyToId}
            replyContent={replyContent}
            onChangeEditContent={setEditContent}
            onStartEdit={(c) => {
              setEditingId(c.id);
              setEditContent(c.content);
            }}
            onSaveEdit={handleEdit}
            onCancelEdit={() => setEditingId(null)}
            onDelete={handleDeleteComment}
            onStartReply={(cid) => {
              setReplyToId(cid);
              setReplyContent("");
            }}
            onChangeReplyContent={setReplyContent}
            onSaveReply={handleAddReply}
            onCancelReply={() => setReplyToId(null)}
            loginNickname={loginNickname}
            loginUserType={loginUserType}
          />
        ))}
      </div>

      {/* ✅ 새 댓글 입력창: 리스트 아래로 이동 */}
      <div className="comment-form">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="댓글 내용을 입력해 주세요. Enter를 입력하여 등록."
        />
        <button onClick={handleAddComment}>등록</button>
      </div>

      {/* 하단 네비게이션 */}
      <div className="post-nav">
        <div className="right-buttons">
          <button
            type="button"
            className="post-nav-item post-nav-prev"
            onClick={goPrev}
          >
            <span className="arrow">&lt;</span>
            <span className="label">이전글</span>
          </button>

          <button
            type="button"
            className="post-nav-item post-nav-list"
            onClick={() => navigate("/board")}
          >
            <img src={list} alt="목록 아이콘" className="list-icon" />
            <span className="label">목록</span>
          </button>

          <button
            type="button"
            className="post-nav-item post-nav-next"
            onClick={goNext}
          >
            <span className="label">다음글</span>
            <span className="arrow">&gt;</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PostDetail;
