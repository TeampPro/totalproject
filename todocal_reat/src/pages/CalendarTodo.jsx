import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "../styles/CalendarTodo.css";

/**
 * props:
 * - onClose(): 모달 닫기
 * - onSave(savedTodo): 저장/수정/삭제 후 Calendar로 전달
 * - editTodo: 수정할 todo 객체
 * - defaultDate: 새 일정 추가 시 선택된 날짜 (YYYY-MM-DD)
 */
function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  const [todo, setTodo] = useState({
    id: editTodo?.id ?? null,
    title: editTodo?.title ?? "",
    content: editTodo?.content ?? "",
    tDate:
      editTodo?.tDate ??
      defaultDate ??
      moment().format("YYYY-MM-DD"),
    location: editTodo?.location ?? "",
    promiseTime: editTodo?.promiseTime ?? "",
    shared: editTodo?.shared ?? false,
  });

  // 수정/추가 모드 전환 시 동기화
  useEffect(() => {
    if (editTodo) {
      setTodo({
        id: editTodo.id,
        title: editTodo.title ?? "",
        content: editTodo.content ?? "",
        tDate:
          editTodo.tDate ??
          moment(editTodo.promiseDate).format("YYYY-MM-DD"),
        location: editTodo.location ?? "",
        promiseTime: editTodo.promiseTime ?? "",
        shared: editTodo.shared ?? false,
      });
    } else if (defaultDate) {
      setTodo((prev) => ({ ...prev, tDate: defaultDate }));
    }
  }, [editTodo, defaultDate]);

  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setTodo((prev) => ({ ...prev, [key]: value }));
  };

  // 저장 또는 수정
  const handleSave = async () => {
    if (!todo.title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

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
      await axios.delete(`http://localhost:8080/api/todos/${todo.id}`);
      alert("삭제되었습니다!");

      onSave({
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
            value={todo.tDate}
            onChange={handleChange("tDate")}
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

        <label>
          약속 시간
          <input
            type="time"
            value={todo.promiseTime}
            onChange={handleChange("promiseTime")}
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
