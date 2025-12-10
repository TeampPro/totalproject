import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "../../api/setupAxios";

function AdminUserTasks() {
  const { userId } = useParams(); // URL 의 :userId (예: as11)
  const navigate = useNavigate();

  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 수정 모달용 상태
  const [editingTask, setEditingTask] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editDate, setEditDate] = useState("");      // 약속 날짜 (YYYY-MM-DD)
  const [editTime, setEditTime] = useState("");      // 약속 시간 (HH:mm)
  const [editLocation, setEditLocation] = useState(""); // 약속 장소
  const [editShared, setEditShared] = useState(false);  // 공유 여부

  // 해당 유저가 작성한 일정 목록 불러오기
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // /api/tasks?userId=as11  → as11 이 볼 수 있는 일정들
        const res = await axios.get("/api/tasks", {
          params: { userId },
        });

        const all = res.data || [];
        // 그 중에서 ownerId === as11 인 것만 → 이 유저가 작성한 일정
        const mine = all.filter((t) => t.ownerId === userId);
        setTasks(mine);
      } catch (err) {
        console.error("❌ 일정 목록 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [userId]);

  // ✅ 제목 클릭 → 일정 상세 페이지로 이동 (/admin/tasks/:taskId)
  const handleGoTaskDetail = (e, taskId) => {
    e.stopPropagation();
    e.preventDefault();
    navigate(`/admin/tasks/${taskId}`);
  };

  // ✅ 수정 버튼 클릭 → 모달 열기 (기존 값들 세팅)
  const handleOpenEditModal = (task) => {
    setEditingTask(task);
    setEditTitle(task.title || "");
    setEditContent(task.content || "");

    // promiseDate → 날짜/시간 분리
    let date = "";
    let time = "";

    if (task.promiseDate) {
      const parts = String(task.promiseDate).split("T");
      date = parts[0] || "";
      if (parts[1]) {
        // HH:mm:ss 또는 HH:mm:ss.SSS 형태에서 앞 5자리만
        time = parts[1].substring(0, 5);
      }
    }

    setEditDate(date);
    // promiseTime 필드가 따로 있으면 우선 사용
    setEditTime(task.promiseTime || time || "");
    setEditLocation(task.location || "");
    setEditShared(Boolean(task.shared));
  };

  // ✅ 모달에서 저장
  const handleSaveEdit = async () => {
    if (!editingTask) return;
    if (!editTitle.trim()) {
      alert("제목은 비워둘 수 없습니다.");
      return;
    }

    // 날짜는 있는 것이 자연스럽다고 보고 필수로 처리 (원하면 완화 가능)
    if (!editDate) {
      alert("약속 날짜를 선택해주세요.");
      return;
    }

    // 날짜 + 시간 → promiseDate(YYYY-MM-DDTHH:mm:ss) 형태로 조합
    const timePart = editTime && editTime.length >= 4 ? editTime : "00:00";
    const newPromiseDate = `${editDate}T${timePart}:00`;

    try {
      const payload = {
        ...editingTask,
        title: editTitle.trim(),
        content: editContent.trim(),
        promiseDate: newPromiseDate,
        location: editLocation,
        promiseTime: editTime || null,
        shared: editShared,
      };

      await axios.put(
        `/api/tasks/${editingTask.id}`,
        payload
      );

      // 화면에서도 반영
      setTasks((prev) =>
        prev.map((t) =>
          t.id === editingTask.id
            ? {
                ...t,
                title: editTitle.trim(),
                content: editContent.trim(),
                promiseDate: newPromiseDate,
                location: editLocation,
                promiseTime: editTime || null,
                shared: editShared,
              }
            : t
        )
      );

      alert("일정이 수정되었습니다.");
      setEditingTask(null);
    } catch (err) {
      console.error("❌ 일정 수정 실패:", err);
      alert("일정 수정 중 오류가 발생했습니다.");
    }
  };

  // ✅ 모달 닫기
  const handleCloseEditModal = () => {
    setEditingTask(null);
  };

  // ✅ 오른쪽 동그라미: 일정 삭제
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("정말 이 일정을 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`/api/tasks/${taskId}`);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
      alert("일정이 삭제되었습니다.");
    } catch (err) {
      console.error("❌ 일정 삭제 실패:", err);
      alert("일정 삭제 중 오류가 발생했습니다.");
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", color: "#f5f5f5" }}>
      <h2>{userId}님의 일정(활동내역)</h2>

      <div
        style={{
          border: "1px solid #444",
          borderRadius: 8,
          padding: 12,
          marginTop: 16,
          backgroundColor: "#1e1e1e",
        }}
      >
        {tasks.length === 0 && <div>등록된 일정이 없습니다.</div>}

        {tasks.map((task) => (
          <div
            key={task.id}
            style={{
              borderBottom: "1px solid #333",
              padding: "8px 0",
            }}
          >
            {/* 제목 + 오른쪽 동그라미 버튼들 */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 4,
              }}
            >
              {/* 제목 (상세로 이동) */}
              <button
                type="button"
                style={{
                  cursor: "pointer",
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  padding: 0,
                  color: "inherit",
                  font: "inherit",
                }}
                onClick={(e) => handleGoTaskDetail(e, task.id)}
              >
                <strong>{task.title}</strong>
              </button>

              {/* 오른쪽 동그라미 두 개: 수정 / 삭제 */}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  className="circle-btn"
                  title="일정 수정"
                  type="button"
                  onClick={() => handleOpenEditModal(task)}
                >
                  수정
                </button>
                <button
                  className="circle-btn"
                  title="일정 삭제"
                  type="button"
                  onClick={() => handleDeleteTask(task.id)}
                >
                  삭제
                </button>
              </div>
            </div>

            {/* 날짜/장소, 내용 */}
            <div style={{ fontSize: 13, opacity: 0.8 }}>
              {task.promiseDate} / {task.location || "-"} /{" "}
              {task.shared ? "공유" : "비공유"}
            </div>
            <div style={{ fontSize: 13 }}>{task.content}</div>
          </div>
        ))}
      </div>

      <button
        style={{ marginTop: 16 }}
        onClick={() => navigate("/admin/users")}
      >
        회원 목록으로
      </button>

      {/* ✅ 수정 모달 */}
      {editingTask && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 2000,
          }}
          onClick={handleCloseEditModal}
        >
          <div
            style={{
              backgroundColor: "#1e1e1e",
              borderRadius: 8,
              padding: 20,
              width: "90%",
              maxWidth: 500,
              color: "#f5f5f5",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>일정 수정</h3>

            {/* 제목 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>제목</label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* 내용 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>내용</label>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={4}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* 약속 날짜 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                약속 날짜
              </label>
              <input
                type="date"
                value={editDate}
                onChange={(e) => setEditDate(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* 약속 시간 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                약속 시간
              </label>
              <input
                type="time"
                value={editTime}
                onChange={(e) => setEditTime(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* 약속 장소 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "block", marginBottom: 4 }}>
                약속 장소
              </label>
              <input
                type="text"
                value={editLocation}
                onChange={(e) => setEditLocation(e.target.value)}
                style={{ width: "100%", padding: 8 }}
              />
            </div>

            {/* 공유 여부 */}
            <div style={{ marginTop: 12 }}>
              <label style={{ display: "inline-flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={editShared}
                  onChange={(e) => setEditShared(e.target.checked)}
                  style={{ marginRight: 8 }}
                />
                공유 일정
              </label>
            </div>

            {/* 모달 버튼들 */}
            <div
              style={{
                marginTop: 16,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button type="button" onClick={handleSaveEdit}>
                저장
              </button>
              <button type="button" onClick={handleCloseEditModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUserTasks;
