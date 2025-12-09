// src/pages/Todo/CalendarTodo.jsx
import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { api } from "../../api/http";
import "../../styles/Todo/CalendarTodo.css";

import toggleOff from "../../assets/toggle_off.svg";
import toggleOn from "../../assets/toggle_on.svg";
import profileBig from "../../assets/profileBig.svg";
import { fetchFriends } from "../../api/friendApi";

/**
 * props:
 * - onClose(): 모달 닫기
 * - onSave(savedTodoOrNull): 저장/수정/삭제 후 부모에서 다시 로딩하도록 쓸 콜백
 * - editTodo: 수정할 일정 객체 (없으면 새로 생성)
 * - defaultDate: 새 일정 생성 시 기본 날짜 (YYYY-MM-DD)
 */
function CalendarTodo({ onClose, onSave, editTodo, defaultDate }) {
  const isEdit = !!editTodo;

  const storedUser = JSON.parse(localStorage.getItem("user") || "null");
  const loginId =
    storedUser?.id || storedUser?.userId || storedUser?.loginId || null;
  const userType = storedUser?.userType;
  const isAdmin = userType === "ADMIN";

  // ✅ 수정 모드에서는 기존 ownerId 를 우선 사용, 없으면 로그인 아이디 사용
  const ownerId = editTodo?.ownerId || loginId;

  // ✅ 수정 화면에서 내가 수정/삭제 할 수 있는지 여부
  const canModify =
    !isEdit || // 새로 추가는 항상 가능
    !editTodo?.ownerId || // ownerId 없는 옛날 데이터 → 처음 수정하는 사람이 주인
    editTodo.ownerId === loginId || // 내가 작성자
    isAdmin; // 관리자

  // -----------------------------
  // 초기값 세팅
  // -----------------------------
  const initialDate = useMemo(
    () =>
      editTodo?.promiseDate
        ? moment(editTodo.promiseDate).format("YYYY-MM-DD")
        : defaultDate || moment().format("YYYY-MM-DD"),
    [editTodo, defaultDate]
  );

  const [title, setTitle] = useState(editTodo?.title || "");
  const [content, setContent] = useState(editTodo?.content || "");
  const [date, setDate] = useState(initialDate);
  const [startTime, setStartTime] = useState(
    editTodo?.promiseDate
      ? moment(editTodo.promiseDate).format("HH:mm")
      : "09:00"
  );
  const [endTime, setEndTime] = useState(
    editTodo?.endDateTime
      ? moment(editTodo.endDateTime).format("HH:mm")
      : "10:00"
  );
  const [location, setLocation] = useState(editTodo?.location || "");
  const [shared, setShared] = useState(
    typeof editTodo?.shared === "boolean" ? editTodo.shared : false
  );
  const [completed, setCompleted] = useState(
    typeof editTodo?.completed === "boolean" ? editTodo.completed : false
  );

  // -----------------------------
  // 친구 목록 + 선택 상태
  // -----------------------------
  const [friends, setFriends] = useState([]);
  const [selectedFriendIds, setSelectedFriendIds] = useState(
    Array.isArray(editTodo?.sharedUserIds) ? editTodo.sharedUserIds : []
  );
  const [loadingFriends, setLoadingFriends] = useState(false);

  // 공유 토글 ON이 되고, 내 아이디가 있을 때 한 번만 친구 목록 불러오기
  useEffect(() => {
    if (!shared) return;
    if (!ownerId) return;
    if (friends.length > 0) return; // 이미 가져왔으면 다시 호출 X

    const loadFriends = async () => {
      try {
        setLoadingFriends(true);
        const data = await fetchFriends(ownerId); // 실제 API 구조에 맞게 friendApi 구현
        setFriends(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("❌ 친구 목록 불러오기 실패:", err);
      } finally {
        setLoadingFriends(false);
      }
    };

    loadFriends();
  }, [shared, ownerId, friends.length]);

  // 친구 선택 / 해제 (리스트 아이템 클릭)
  const toggleFriend = (friendId) => {
    setSelectedFriendIds((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  // -----------------------------
  // 저장 / 수정
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 수정 모드인데 권한 없으면 바로 차단
    if (isEdit && !canModify) {
      alert("이 일정은 수정할 권한이 없습니다.");
      return;
    }

    if (!title.trim()) {
      alert("제목을 입력해 주세요.");
      return;
    }
    if (!date) {
      alert("날짜를 선택해 주세요.");
      return;
    }

    // "YYYY-MM-DDTHH:mm:ss" 로컬시간 문자열
    const startStr = `${date}T${startTime || "09:00"}:00`;
    const endStr = `${date}T${endTime || startTime || "10:00"}:00`;

    const start = moment(startStr);
    const end = moment(endStr);

    if (!start.isValid()) {
      alert("시작 시간이 올바르지 않습니다.");
      return;
    }
    if (!end.isValid() || end.isBefore(start)) {
      alert("종료 시간은 시작 시간 이후로 설정해 주세요.");
      return;
    }

    const payload = {
      title: title.trim(),
      content: content.trim(),
      promiseDate: startStr,
      endDateTime: endStr,
      ownerId,
      shared,
      location: location.trim() || null,
      completed,
      // 🔥 백엔드에서 Task.sharedUserIds (Transient) 로 받음
      sharedUserIds: shared ? selectedFriendIds : [],
    };

        try {
      let res;
      if (isEdit && editTodo?.id != null) {
        // 수정: 로그인한 사용자 아이디를 userId로 전달
        res = await api.put(`/api/tasks/${editTodo.id}`, payload, {
          params: { userId: loginId },
        });
        alert("일정이 수정되었습니다.");
      } else {
        // 생성
        res = await api.post("/api/tasks", payload);
        alert("일정이 저장되었습니다.");
      }

      // 🔥 서버 응답에는 sharedUserIds가 안 실려 있으니까
      //    프론트에서 선택한 목록을 다시 붙여서 부모로 넘겨준다.
      const base = res?.data ?? res ?? null;
      const saved = base
        ? {
            ...base,
            sharedUserIds: shared ? selectedFriendIds : [],
          }
        : null;

      if (onSave) onSave(saved);
      onClose();
    } catch (err) {
      console.error("❌ 일정 저장 실패:", err);
      alert("일정 저장 중 오류가 발생했습니다.");
    }
  };

  // -----------------------------
  // 삭제 (수정 모드만)
  // -----------------------------
  const handleDelete = async () => {
    if (!isEdit || !editTodo?.id) return;
    if (!canModify) {
      alert("이 일정은 삭제할 권한이 없습니다.");
      return;
    }
    if (!window.confirm("해당 일정을 삭제하시겠습니까?")) return;

    try {
      // 🔹 삭제도 로그인 유저 아이디를 userId 로 전달
      await api.del(`/api/tasks/${editTodo.id}`, {
        params: { userId: loginId },
      });
      alert("일정이 삭제되었습니다.");
      if (onSave) onSave({ deleted: true, id: editTodo.id });
      onClose();
    } catch (err) {
      console.error("❌ 일정 삭제 실패:", err);
      alert("일정 삭제 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className="todo-modal-overlay">
      <div className="todo-modal">
        {/* 상단 헤더 */}
        <div className="todo-modal-header">
          <div className="todo-modal-titleBox">
            <img
              src={profileBig}
              alt="프로필"
              className="todo-modal-profileIcon"
            />
            <div className="todo-modal-title">
              {isEdit ? "일정 수정하기" : "일정 추가하기"}
            </div>
          </div>

          <button
            type="button"
            className="todo-modal-closeX"
            onClick={onClose}
            aria-label="닫기"
          >
            ✕
          </button>
        </div>

        {/* 권한 안내 (수정 모드 + 권한 없음일 때) */}
        {isEdit && !canModify && (
          <div
            style={{
              fontSize: 11,
              color: "#d92d20",
              marginBottom: 8,
              padding: "4px 8px",
              background: "#fff4f4",
              borderRadius: 6,
            }}
          >
            이 일정은 다른 사용자가 작성한 공유 일정입니다.
          </div>
        )}

        {/* 본문 */}
        <form className="todo-modal-body" onSubmit={handleSubmit}>
          {/* 제목 */}
          <div className="todo-field">
            <div className="todo-field-label">제목</div>
            <div className="todo-field-sub">일정 제목을 입력해 주세요.</div>
            <input
              type="text"
              className="todo-input"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={50}
              disabled={isEdit && !canModify}
            />
          </div>

          {/* 내용 */}
          <div className="todo-field">
            <div className="todo-field-label">내용</div>
            <div className="todo-field-sub">간단한 설명을 입력해 주세요.</div>
            <textarea
              className="todo-textarea"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              maxLength={200}
              disabled={isEdit && !canModify}
            />
          </div>

          {/* 날짜 + 시간 */}
          <div className="todo-field">
            <div className="todo-field-label">날짜 / 시간</div>
            <div className="todo-field-sub">
              약속 날짜와 시작·종료 시간을 설정하세요.
            </div>
            <div style={{ display: "flex", gap: 4 }}>
              <input
                type="date"
                className="todo-input"
                style={{ flex: 1 }}
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isEdit && !canModify}
              />
            </div>
            <div
              style={{
                display: "flex",
                gap: 4,
                marginTop: 4,
              }}
            >
              <input
                type="time"
                className="todo-input"
                style={{ flex: 1 }}
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                disabled={isEdit && !canModify}
              />
              <input
                type="time"
                className="todo-input"
                style={{ flex: 1 }}
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                disabled={isEdit && !canModify}
              />
            </div>
          </div>

          {/* 장소 */}
          <div className="todo-field">
            <div className="todo-field-label">장소</div>
            <div className="todo-field-sub">
              만나기로 한 장소를 입력해 주세요. (선택)
            </div>
            <input
              type="text"
              className="todo-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={100}
              disabled={isEdit && !canModify}
            />
          </div>

          {/* 완료 체크 (수정 + 권한 있을 때만) */}
          {isEdit && canModify && (
            <div className="todo-field">
              <div className="todo-field-label">완료 상태</div>
              <div className="todo-field-sub">
                완료된 일정이면 체크해 주세요.
              </div>
              <label style={{ fontSize: 9 }}>
                <input
                  type="checkbox"
                  checked={completed}
                  onChange={(e) => setCompleted(e.target.checked)}
                  style={{ marginRight: 4 }}
                />
                완료 처리
              </label>
            </div>
          )}

          {/* 공유 토글 */}
          <div className="todo-field todo-shared-row">
            <div>
              <div className="todo-field-label shared-label">공유 일정</div>
              <div className="todo-field-sub">
                친구와 함께 보는 일정인지 설정해 주세요.
              </div>
            </div>
            <button
              type="button"
              className="toggle-btn"
              onClick={() => setShared((prev) => !prev)}
              disabled={isEdit && !canModify}
            >
              <img
                src={shared ? toggleOn : toggleOff}
                alt={shared ? "공유 ON" : "공유 OFF"}
              />
            </button>
          </div>

          {/* 공유 ON일 때 친구 리스트 */}
          {shared && (
            <div className="todo-field todo-share-list-wrap">
              <div className="todo-field-label">공유할 친구</div>
              <div className="todo-field-sub">
                리스트에서 이름을 눌러 공유 대상을 선택/해제할 수 있습니다.
              </div>

              {loadingFriends && (
                <div className="todo-share-list-helper">
                  친구 목록을 불러오는 중입니다...
                </div>
              )}

              {!loadingFriends && friends.length === 0 && (
                <div className="todo-share-list-helper">
                  등록된 친구가 없습니다.
                </div>
              )}

              {!loadingFriends && friends.length > 0 && (
                <div className="todo-share-list">
                  {friends.map((f) => {
                    const fid = f.id ?? f.friendId ?? f.loginId ?? f.userId;
                    if (!fid) return null;

                    const label =
                      f.nickname || f.name || f.loginId || f.userId || "친구";

                    const selected = selectedFriendIds.includes(fid);

                    return (
                      <button
                        key={fid}
                        type="button"
                        className={
                          "todo-share-friend" + (selected ? " selected" : "")
                        }
                        onClick={() => toggleFriend(fid)}
                        disabled={isEdit && !canModify}
                      >
                        <span className="todo-share-friend-name">
                          {label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 하단 버튼들 */}
          <div className="modal-buttons">
            {isEdit && canModify && (
              <button
                type="button"
                className="danger-btn"
                onClick={handleDelete}
              >
                삭제
              </button>
            )}
            <button
              type="button"
              className="secondary-btn"
              onClick={onClose}
            >
              취소
            </button>
            {(!isEdit || canModify) && (
              <button type="submit" className="primary-btn">
                {isEdit ? "수정하기" : "추가하기"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default CalendarTodo;
