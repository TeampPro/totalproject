import { useState, useEffect } from "react";
import moment from "moment";
import { api } from "../../api/http";
import "../../styles/Todo/CalendarTodo.css";

/**
 * props:
 * - onClose(): 모달 닫기
 * - onSave(savedTodo): 저장/수정/삭제 후 부모로 전달
 * - editTodo: 수정할 todo 객체 (id, title, content, promiseDate, endDateTime, location, shared ...)
 * - defaultDate: 새 일정 추가 시 선택된 날짜 (YYYY-MM-DD)
 */
function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  // ⚙ 초기 상태 (수정/추가 공통)
  const [todo, setTodo] = useState(() => {
    if (editTodo) {
      return {
        id: editTodo.id ?? null,
        title: editTodo.title ?? "",
        content: editTodo.content ?? "",
        date: editTodo.promiseDate
          ? moment(editTodo.promiseDate).format("YYYY-MM-DD")
          : defaultDate ?? moment().format("YYYY-MM-DD"),
        time: editTodo.promiseDate
          ? moment(editTodo.promiseDate).format("HH:mm")
          : "",
        endTime: editTodo.endDateTime
          ? moment(editTodo.endDateTime).format("HH:mm")
          : "",
        location: editTodo.location ?? "",
        shared: editTodo.shared ?? false,
      };
    }

    return {
      id: null,
      title: "",
      content: "",
      date: defaultDate ?? moment().format("YYYY-MM-DD"),
      time: "",
      endTime: "",
      location: "",
      shared: false,
    };
  });

  // 로그인 유저 정보
  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const isGuest = storedUser?.id?.startsWith("guest_");
  const canShare = !!storedUser?.id && !isGuest;
  const isOwner = storedUser?.id === editTodo?.ownerId;

  // editTodo / defaultDate 변경 시 동기화
  useEffect(() => {
    if (editTodo) {
      setTodo({
        id: editTodo.id ?? null,
        title: editTodo.title ?? "",
        content: editTodo.content ?? "",
        date: editTodo.promiseDate
          ? moment(editTodo.promiseDate).format("YYYY-MM-DD")
          : defaultDate ?? moment().format("YYYY-MM-DD"),
        time: editTodo.promiseDate
          ? moment(editTodo.promiseDate).format("HH:mm")
          : "",
        endTime: editTodo.endDateTime
          ? moment(editTodo.endDateTime).format("HH:mm")
          : "",
        location: editTodo.location ?? "",
        shared: editTodo.shared ?? false,
      });
    } else if (defaultDate) {
      setTodo((prev) => ({
        ...prev,
        date: defaultDate,
      }));
    }
  }, [editTodo, defaultDate]);

  // 입력 공통 처리
  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setTodo((prev) => ({ ...prev, [key]: value }));
  };

  // 저장 or 수정
  const handleSave = async () => {
    if (!todo.title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    // 시작/종료 시간 → LocalDateTime 형태 문자열로 변환
    const start = `${todo.date}T${todo.time || "00:00"}:00`;
    const end = todo.endTime
      ? `${todo.date}T${todo.endTime}:00`
      : moment(start).add(1, "hour").format("YYYY-MM-DDTHH:mm:ss");

    const payload = {
      title: todo.title.trim(),
      content: todo.content?.trim() ?? "",
      promiseDate: start,
      endDateTime: end,
      location: todo.location ?? "",
      shared: canShare ? todo.shared ?? false : false,
      ownerId: storedUser?.id || null,
    };

    try {
      let res;
      if (isEdit && todo.id != null) {
        // 수정
        res = await api.put(`/api/tasks/${todo.id}`, payload);
        alert("할 일이 수정되었습니다.");
      } else {
        // 추가
        res = await api.post("/api/tasks", payload);
        alert("할 일이 저장되었습니다.");
      }

      const saved = res?.data ?? res ?? {};

      const finalTodo = {
        ...saved,
        id: saved.id ?? todo.id,
        title: saved.title ?? todo.title,
        content: saved.content ?? todo.content,
        location: saved.location ?? todo.location,
        shared: saved.shared ?? todo.shared,
        promiseDate: saved.promiseDate ?? start,
        endDateTime: saved.endDateTime ?? end,
        tDate: moment(saved.promiseDate ?? start).format("YYYY-MM-DD"),
        time: moment(saved.promiseDate ?? start).format("HH:mm"),
        endTime: moment(saved.endDateTime ?? end).format("HH:mm"),
      };

      await onSave(finalTodo);
      onClose();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장에 실패했습니다. 콘솔을 확인해주세요.");
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");

      await api.delete(`/api/tasks/${todo.id}`, {
        params: { userId: user?.id || "" },
      });

      alert("삭제되었습니다.");

      await onSave({
        id: todo.id,
        deleted: true,
      });

      onClose();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제에 실패했습니다. 콘솔을 확인해주세요.");
    }
  };

  return (
    <div className="todo-modal-overlay" onClick={onClose}>
      <div className="todo-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{isEdit ? "할 일 수정 / 삭제" : "새로운 할 일 추가"}</h3>

        <label>
          날짜
          <input
            type="date"
            value={todo.date}
            onChange={handleChange("date")}
          />
        </label>

        <label>
          시작 시간
          <input
            type="time"
            value={todo.time}
            onChange={handleChange("time")}
          />
        </label>

        <label>
          종료 시간
          <input
            type="time"
            value={todo.endTime}
            onChange={handleChange("endTime")}
          />
        </label>

        <label>
          제목
          <input
            type="text"
            value={todo.title}
            onChange={handleChange("title")}
            placeholder="제목을 입력하세요"
          />
        </label>

        <label>
          내용
          <textarea
            value={todo.content}
            onChange={handleChange("content")}
            placeholder="내용을 입력하세요"
          />
        </label>

        <label>
          약속 장소
          <input
            type="text"
            value={todo.location}
            onChange={handleChange("location")}
            placeholder="약속 장소를 입력하세요"
          />
        </label>

        <label className="shared-check">
          <input
            type="checkbox"
            checked={canShare ? todo.shared : false}
            onChange={(e) => {
              if (!canShare) {
                alert("비회원은 공유할 수 없습니다.");
                return;
              }
              handleChange("shared")(e);
            }}
          />
          {canShare ? "공유 일정으로 표시" : "비회원은 공유 불가"}
        </label>

        <div className="modal-buttons">
          {isEdit ? (
            <>
              <button onClick={handleSave} disabled={!isOwner}>
                수정
              </button>
              <button onClick={handleDelete} disabled={!isOwner}>
                삭제
              </button>
              {!isOwner && <p>※ 공유 일정은 본인만 수정/삭제할 수 있습니다.</p>}
              <button onClick={onClose}>닫기</button>
            </>
          ) : (
            <>
              <button onClick={handleSave}>저장</button>
              <button onClick={onClose}>취소</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarTodo;
