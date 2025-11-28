import { useState, useEffect } from "react";
import axios from "axios";
import { api } from "../../api/http";
import moment from "moment";
import "../../styles/Todo/CalendarTodo.css";

import toggleOff from "../../assets/toggle_off.svg";
import toggleOn from "../../assets/toggle_on.svg";
import profileBig from "../../assets/profileBig.svg";

/**
 * props:
 * - onClose(): 모달 닫기
 * - onSave(savedTodo): 저장/수정/삭제 후 부모(Todo/SharedTodo)로 전달
 * - editTodo: 수정할 todo 객체 (id, title, content, promiseDate, endDateTime, location, shared, ownerId ...)
 * - defaultDate: 새 일정 추가 시 선택된 날짜 (YYYY-MM-DD)
 */
function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  // ⚙ 초기 상태 (수정/추가 공통으로 사용)
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

  // 로그인 유저에서 ownerId 꺼내기
  const storedUser = JSON.parse(localStorage.getItem("user"));
  const isLoggedIn = !!storedUser?.id;
  const isGuest = storedUser?.id?.startsWith("guest_"); // guest_로 시작하면 비회원
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
      shared: canShare ? todo.shared ?? false : false, // 게스트면 무조건 false
      ownerId: storedUser?.id || null,
    };

    try {
      let res;
      if (isEdit && todo.id != null) {
        // 수정
        res = await axios.put(
          `http://localhost:8080/api/tasks/${todo.id}`,
          payload
        );
        alert("할 일이 수정되었습니다.");
      } else {
        // 추가
        res = await axios.post("http://localhost:8080/api/tasks", payload);
        alert("할 일이 저장되었습니다.");
      }

      const saved = res?.data ?? {};

      // 부모에서 쓰기 편하도록 서버 데이터 + 보조 필드 같이 넘김
      const finalTodo = {
        ...saved,
        id: saved.id ?? todo.id,
        title: saved.title ?? todo.title,
        content: saved.content ?? todo.content,
        location: saved.location ?? todo.location,
        shared: saved.shared ?? todo.shared,
        promiseDate: saved.promiseDate ?? start,
        endDateTime: saved.endDateTime ?? end,
        ownerId:
          saved.ownerId ??
          (editTodo && editTodo.ownerId) ??
          (storedUser?.id || null),
        tDate: moment(saved.promiseDate ?? start).format("YYYY-MM-DD"),
        time: moment(saved.promiseDate ?? start).format("HH:mm"),
        endTime: moment(saved.endDateTime ?? end).format("HH:mm"),
      };

      onSave(finalTodo);
      onClose();
    } catch (err) {
      console.error("❌ 저장 실패:", err);
      if (err?.response?.status === 403) {
        alert("수정 권한이 없습니다.");
      } else {
        alert("저장에 실패했습니다. 콘솔을 확인해주세요.");
      }
    }
  };

  // 삭제
  const handleDelete = async () => {
    if (!window.confirm("정말 삭제하시겠습니까?")) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      await axios.delete(
        `http://localhost:8080/api/tasks/${todo.id}?userId=${user?.id || ""}`
      );
      alert("삭제되었습니다.");

      onSave({
        id: todo.id,
        deleted: true,
      });

      onClose();
    } catch (err) {
      console.error("❌ 삭제 실패:", err);
      if (err?.response?.status === 403) {
        alert("삭제 권한이 없습니다.");
      } else {
        alert("삭제에 실패했습니다. 콘솔을 확인해주세요.");
      }
    }
  };

  // 공유 토글 클릭
  const handleToggleShared = () => {
    if (!canShare) {
      alert("비회원은 공유할 수 없습니다.");
      return;
    }
    setTodo((prev) => ({ ...prev, shared: !prev.shared }));
  };

  return (
    <div className="todo-modal-overlay" onClick={onClose}>
      <div className="todo-modal" onClick={(e) => e.stopPropagation()}>
        {/* 상단 헤더 */}
        <div className="todo-modal-header">
          <div className="todo-modal-titleBox">
            <img
              src={profileBig}
              alt="프로필 아이콘"
              className="todo-modal-profileIcon"
            />
            <span className="todo-modal-title">
              {isEdit ? "할 일 수정 / 삭제" : "새로운 할 일을 기록하세요 !"}
            </span>
          </div>
          <button
            type="button"
            className="todo-modal-closeX"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* 폼 영역 */}
        <div className="todo-modal-body">
          {/* 날짜 */}
          <div className="todo-field">
            <label className="todo-field-label">D-day (날짜)</label>
            <span className="todo-field-sub">
              날짜를 선택해주세요.
            </span>
            <input
              type="date"
              value={todo.date}
              onChange={handleChange("date")}
              className="todo-input"
            />
          </div>

          {/* 시작 시간 */}
          <div className="todo-field">
            <label className="todo-field-label">D-day (시작 시간)</label>
            <span className="todo-field-sub">
              일정이 시작되는 시간을 입력해주세요.
            </span>
            <input
              type="time"
              value={todo.time}
              onChange={handleChange("time")}
              className="todo-input"
            />
          </div>

          {/* 종료 시간 */}
          <div className="todo-field">
            <label className="todo-field-label">D-day (종료 시간)</label>
            <span className="todo-field-sub">
              일정이 종료되는 시간을 입력해주세요.
            </span>
            <input
              type="time"
              value={todo.endTime}
              onChange={handleChange("endTime")}
              className="todo-input"
            />
          </div>

          {/* 제목 */}
          <div className="todo-field">
            <label className="todo-field-label">일정 제목</label>
            <input
              type="text"
              value={todo.title}
              onChange={handleChange("title")}
              className="todo-input"
              placeholder="일정의 제목을 입력해주세요."
            />
          </div>

          {/* 설명 */}
          <div className="todo-field">
            <label className="todo-field-label">일정 설명</label>
            <textarea
              value={todo.content}
              onChange={handleChange("content")}
              className="todo-textarea"
              placeholder="일정에 대한 설명을 입력해주세요."
            />
          </div>

          {/* 장소 */}
          <div className="todo-field">
            <label className="todo-field-label">장소</label>
            <input
              type="text"
              value={todo.location}
              onChange={handleChange("location")}
              className="todo-input"
              placeholder="선택 항목, 약속 장소를 입력해주세요."
            />
          </div>

          {/* 공유 토글 */}
          <div className="todo-field todo-shared-row">
            <span className="todo-field-label shared-label">
              공유 일정으로 표시
            </span>
            <button
              type="button"
              className="toggle-btn"
              onClick={handleToggleShared}
            >
              <img
                src={todo.shared ? toggleOn : toggleOff}
                alt={todo.shared ? "공유 일정 ON" : "공유 일정 OFF"}
              />
            </button>
          </div>
        </div>

        {/* 하단 버튼 */}
        <div className="modal-buttons">
          {isEdit ? (
            <>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSave}
              >
                수정하기
              </button>
              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
              >
                삭제
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={onClose}
              >
                닫기
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                className="primary-btn"
                onClick={handleSave}
              >
                추가하기
              </button>
              <button
                type="button"
                className="secondary-btn"
                onClick={onClose}
              >
                취소
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default CalendarTodo;
