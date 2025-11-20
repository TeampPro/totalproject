// src/components/Admin/AdminTaskDetail.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AdminTaskDetail() {
  const { taskId } = useParams(); // URL의 :taskId
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTask = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/tasks/${taskId}`
        );
        setTask(res.data || null);
      } catch (err) {
        console.error("❌ 일정 상세 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTask();
  }, [taskId]);

  if (loading) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

  if (!task) {
    return (
      <div style={{ padding: 20 }}>
        일정을 찾을 수 없습니다.
        <br />
        <button onClick={() => navigate(-1)}>뒤로가기</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", color: "#f5f5f5" }}>
      <h2>일정 상세</h2>
      <div
        style={{
          border: "1px solid #444",
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          backgroundColor: "#1e1e1e",
        }}
      >
        <p>
          <strong>제목:</strong> {task.title}
        </p>
        <p>
          <strong>내용:</strong> {task.content || "-"}
        </p>
        <p>
          <strong>약속 시간:</strong> {task.promiseDate || "-"}
        </p>
        <p>
          <strong>장소:</strong> {task.location || "-"}
        </p>
        <p>
          <strong>작성자(ownerId):</strong> {task.ownerId || "-"}
        </p>
        <p>
          <strong>공유 여부(shared):</strong>{" "}
          {task.shared ? "공유" : "비공유"}
        </p>
      </div>

      <button style={{ marginTop: 16 }} onClick={() => navigate(-1)}>
        뒤로가기
      </button>
    </div>
  );
}

export default AdminTaskDetail;
