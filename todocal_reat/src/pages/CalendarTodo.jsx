import { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "../styles/CalendarTodo.css";

function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  const [todo, setTodo] = useState(
    editTodo || {
      title: "",
      content: "",
      tDate: defaultDate || moment().format("YYYY-MM-DD"),
    }
  );

  useEffect(() => {
    if (editTodo) {
      setTodo(editTodo);
    } else if (defaultDate) {
      setTodo((prev) => ({ ...prev, tDate: defaultDate })); // 모달 재오픈 시도 대비
    }
  }, [editTodo, defaultDate]);

  /* ✅ 저장 */
  const handleSave = async () => {
    if (!todo.title.trim()) {
      alert("제목을 입력해주세요!");
      return;
    }
    if (!todo.tDate) {
      setTodo((prev) => ({ ...prev, tDate: defaultDate || moment().format("YYYY-MM-DD") }));
    }

    try {
      let res;
      if (isEdit) {
        console.log("✏ 수정 시 날짜 데이터:", todo.tDate);
        res = await axios.put(
          `http://localhost:8080/api/todos/${todo.todoId}`,
          {
            ...todo,
            tDate: moment(todo.tDate).format("YYYY-MM-DD")
          }
        );
        alert("할 일이 수정되었습니다!");
      } else {
        console.log("➕ 추가 시 날짜 데이터:", todo.tDate);
        res = await axios.post("http://localhost:8080/api/todos", {
          ...todo,
          tDate: moment(todo.tDate).format("YYYY-MM-DD"),
        });
        alert("할 일이 추가되었습니다!");
      }
      console.log("📌 서버 저장 완료 → 받은 데이터:", res.data);

      // ✅ 서버 응답 데이터에 현재 선택된 날짜(tDate) 강제 덮어쓰기
      const fixedData = {
        ...res.data,
        tDate: moment(todo.tDate).format("YYYY-MM-DD"),
      };

      onSave(fixedData);
      onClose();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
    }
  };

  /* ✅ 삭제 */
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;
    try {
      await axios.delete(`http://localhost:8080/api/todos/${todo.todoId}`);
      alert("삭제되었습니다!");
      onSave({ ...todo, deleted: true });
      onClose();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
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
            onChange={(e) => setTodo({ ...todo, tDate: e.target.value })}
          />
        </label>

        <label>
          제목
          <input
            type="text"
            value={todo.title}
            onChange={(e) => setTodo({ ...todo, title: e.target.value })}
          />
        </label>

        <label>
          내용
          <textarea
            value={todo.content}
            onChange={(e) => setTodo({ ...todo, content: e.target.value })}
          />
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
