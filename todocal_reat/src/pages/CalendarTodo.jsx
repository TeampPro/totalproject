import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "../styles/CalendarTodo.css";

function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  const [todo, setTodo] = useState({
    id: editTodo?.id ?? null,
    title: editTodo?.title ?? "",
    content: editTodo?.content ?? "",
    date: editTodo
      ? moment(editTodo.promiseDate).format("YYYY-MM-DD")
      : defaultDate ?? moment().format("YYYY-MM-DD"),
    time: editTodo ? moment(editTodo.promiseDate).format("HH:mm") : "",
    endTime: editTodo?.endDateTime
      ? moment(editTodo.endDateTime).format("HH:mm")
      : "",
    location: editTodo?.location ?? "",
    shared: editTodo?.shared ?? false,
  });

<<<<<<< HEAD
=======
  // 수정/추가 모드 전환 시 동기화
>>>>>>> origin/login
  useEffect(() => {
    if (isEdit && editTodo) {
      setTodo({
        id: editTodo.id,
        title: editTodo.title,
        content: editTodo.content,
        date: moment(editTodo.promiseDate).format("YYYY-MM-DD"),
        time: moment(editTodo.promiseDate).format("HH:mm"),
        endTime: editTodo.endDateTime
          ? moment(editTodo.endDateTime).format("HH:mm")
          : "",
        location: editTodo.location,
        shared: editTodo.shared,
      });
    }
  }, [editTodo]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setTodo((prev) => ({ ...prev, [key]: value }));
  };

<<<<<<< HEAD
=======
  // 저장 또는 수정
>>>>>>> origin/login
  const handleSave = async () => {
    if (!todo.title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

<<<<<<< HEAD
    const start = `${todo.date}T${todo.time || "00:00"}:00`;

    const end = todo.endTime
      ? `${todo.date}T${todo.endTime}:00`
      : moment(start).add(1, "hour").format("YYYY-MM-DDTHH:mm:ss");

    const payload = {
      title: todo.title,
      content: todo.content,
      promiseDate: start,
      endDateTime: end,
      location: todo.location,
      shared: todo.shared,
    };

    try {
      const res = isEdit
        ? await axios.put(`http://localhost:8080/api/tasks/${todo.id}`, payload)
        : await axios.post("http://localhost:8080/api/tasks", payload);

      alert(isEdit ? "할 일이 수정되었습니다." : "할 일이 저장되었습니다.");
      onSave(res.data);
=======
    // ★ ownerId 설정
    const storedUser = JSON.parse(localStorage.getItem("user"));

    const payload = {
      title: todo.title.trim(),
      content: todo.content?.trim() ?? "",
      promiseDate: moment(todo.tDate).format("YYYY-MM-DDTHH:mm:ss"),
      location: todo.location ?? "",
      promiseTime: todo.promiseTime ?? "",
      shared: todo.shared ?? false,
      ownerId: storedUser?.id || null, // ★ 추가
    };

    try {
      let res;
      if (isEdit && todo.id != null) {
        // 수정
        res = await axios.put(
          `http://localhost:8080/api/todos/${todo.id}`,
          payload
        );
        alert("할 일이 수정되었습니다!");
      } else {
        // 추가
        res = await axios.post("http://localhost:8080/api/todos", payload);
        alert("할 일이 추가되었습니다!");
      }

      const saved = res?.data ?? {};
      const normalized = {
        id: saved.id ?? todo.id,
        title: saved.title ?? todo.title,
        content: saved.content ?? todo.content,
        tDate: moment(todo.tDate).format("YYYY-MM-DD"),
        promiseDate:
          saved.promiseDate ??
          moment(todo.tDate).format("YYYY-MM-DD"),
        location: saved.location ?? todo.location,
        promiseTime: saved.promiseTime ?? todo.promiseTime,
        shared: saved.shared ?? todo.shared,
      };

      onSave(normalized);
>>>>>>> origin/login
      onClose();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

<<<<<<< HEAD
=======
  // 삭제
>>>>>>> origin/login
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/tasks/${todo.id}`);
      alert("삭제되었습니다.");
      onSave({ id: todo.id, deleted: true });
      onClose();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      alert("삭제 실패!");
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
          />
        </label>

        <label>
          내용
          <textarea value={todo.content} onChange={handleChange("content")} />
        </label>

        <label>
          약속 장소
          <input
            type="text"
            value={todo.location}
            onChange={handleChange("location")}
          />
        </label>

        <label className="shared-check">
          <input
            type="checkbox"
            checked={todo.shared}
            onChange={handleChange("shared")}
          />
          공유 일정으로 표시
        </label>

        <div className="modal-buttons">
          {isEdit ? (
            <>
              <button onClick={handleSave}>수정</button>
              <button onClick={handleDelete}>삭제</button>
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
