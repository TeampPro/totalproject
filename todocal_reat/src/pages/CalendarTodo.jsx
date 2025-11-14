import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "../styles/CalendarTodo.css";

/**
 * props:
 * - onClose(): 모달 닫기
 * - onSave(savedTodo): Calendar에 전달
 * - editTodo: 수정 모드일 때 기존 일정 데이터
 * - defaultDate: 새 일정 추가 시 선택된 날짜
 */
function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  /** ============================
   *  초기 상태
   * ============================ */
  const [todo, setTodo] = useState({
    id: editTodo?.id ?? null,
    title: editTodo?.title ?? "",
    content: editTodo?.content ?? "",
    tDate: editTodo?.tDate ?? defaultDate ?? moment().format("YYYY-MM-DD"),
    location: editTodo?.location ?? "",
    promiseTime: editTodo?.promiseTime ?? "",
    shared: editTodo?.shared ?? false,
  });

  /** ============================
   *  수정 모드 → 초기 데이터 동기화
   * ============================ */
  useEffect(() => {
    if (isEdit) {
      setTodo({
        id: editTodo.id,
        title: editTodo.title ?? "",
        content: editTodo.content ?? "",
        tDate:
          editTodo.tDate ?? moment(editTodo.promiseDate).format("YYYY-MM-DD"),
        location: editTodo.location ?? "",
        promiseTime: editTodo.promiseTime ?? "",
        shared: editTodo.shared ?? false,
      });
    } else if (defaultDate) {
      setTodo((prev) => ({ ...prev, tDate: defaultDate }));
    }
  }, [editTodo, defaultDate, isEdit]);

  /** ============================
   *  입력 핸들러
   * ============================ */
  const handleChange = (key) => (e) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setTodo((prev) => ({ ...prev, [key]: value }));
  };

  /** ============================
   *  저장 / 수정
   * ============================ */
  const handleSave = async () => {
    if (!todo.title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }

    // **백엔드에서 promiseDate는 LocalDate 형식 → 날짜만 저장**
    const payload = {
      title: todo.title.trim(),
      content: todo.content?.trim() ?? "",
      promiseDate: moment(todo.tDate).format("YYYY-MM-DD"), // 날짜
      location: todo.location ?? "",
      promiseTime: todo.promiseTime ?? "", // 시간(HH:mm)
      shared: todo.shared ?? false,
    };

    try {
      let res;
      if (isEdit) {
        res = await axios.put(
          `http://localhost:8080/api/todos/${todo.id}`,
          payload
        );
        alert("할 일이 수정되었습니다!");
      } else {
        res = await axios.post("http://localhost:8080/api/todos", payload);
        alert("할 일이 추가되었습니다!");
      }

      const saved = res?.data ?? {};

      const normalized = {
        id: saved.id ?? todo.id,
        title: saved.title ?? todo.title,
        content: saved.content ?? todo.content,
        tDate: saved.promiseDate ?? payload.promiseDate,
        location: saved.location ?? todo.location,
        promiseTime: saved.promiseTime ?? todo.promiseTime,
        shared: saved.shared ?? todo.shared,
      };

      onSave(normalized);
      onClose();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      alert("저장에 실패했습니다.");
    }
  };

  /** ============================
   *  삭제
   * ============================ */
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      await axios.delete(`http://localhost:8080/api/todos/${todo.id}`);

      onSave({
        id: todo.id,
        deleted: true,
      });

      alert("삭제되었습니다!");
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

        {/* 날짜 */}
        <label>
          날짜
          <input
            type="date"
            value={todo.tDate}
            onChange={handleChange("tDate")}
          />
        </label>

        {/* 제목 */}
        <label>
          제목
          <input
            type="text"
            value={todo.title}
            onChange={handleChange("title")}
            placeholder="제목을 입력하세요"
          />
        </label>

        {/* 내용 */}
        <label>
          내용
          <textarea
            value={todo.content}
            onChange={handleChange("content")}
            placeholder="내용을 입력하세요"
          />
        </label>

        {/* 장소 */}
        <label>
          약속 장소
          <input
            type="text"
            value={todo.location}
            onChange={handleChange("location")}
            placeholder="약속 장소를 입력하세요"
          />
        </label>

        {/* 약속 시간 */}
        <label>
          약속 시간
          <input
            type="time"
            value={todo.promiseTime}
            onChange={handleChange("promiseTime")}
          />
        </label>

        {/* 공유 체크 */}
        <label className="shared-check">
          <input
            type="checkbox"
            checked={todo.shared}
            onChange={handleChange("shared")}
          />
          공유 일정으로 표시
        </label>

        {/* 버튼 */}
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
