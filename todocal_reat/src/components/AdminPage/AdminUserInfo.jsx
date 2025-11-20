// src/components/AdminPage/AdminUserInfo.jsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

function AdminUserInfo() {
  const { userId } = useParams(); // URL의 :userId (예: as11)
  const location = useLocation();
  const navigate = useNavigate();

  // 목록에서 넘어올 때 state로 user를 받을 수 있음
  const initialUser = location.state?.user || null;

  const [user, setUser] = useState(initialUser);
  const [loading, setLoading] = useState(!initialUser);
  const [saving, setSaving] = useState(false);

  // 수정 폼 상태
  const [form, setForm] = useState({
    name: initialUser?.name || "",
    nickname: initialUser?.nickname || "",
    userType: initialUser?.userType || "NORMAL",
    newPassword: "",
  });

  // 서버에서 단일 회원 정보 다시 가져오기 (새로고침·URL 직접접근 대비)
  useEffect(() => {
    if (initialUser) return; // state에 이미 있으면 호출 안 함

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `http://localhost:8080/api/admin/users/${encodeURIComponent(userId)}`
        );
        const u = res.data;

        setUser(u);
        setForm({
          name: u.name || "",
          nickname: u.nickname || "",
          userType: u.userType || "NORMAL",
          newPassword: "",
        });
      } catch (err) {
        console.error("❌ 사용자 정보 불러오기 실패:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [initialUser, userId]);

  const handleChange = (key) => (e) => {
    setForm((prev) => ({
      ...prev,
      [key]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    // 🔥 길이 제한 전부 제거: newPassword가 있으면 그대로 보냄
    const payload = {
      name: form.name,
      nickname: form.nickname,
      userType: form.userType,
      newPassword: form.newPassword || null, // 비워두면 변경 없음
    };

    try {
      setSaving(true);
      const res = await axios.put(
        `http://localhost:8080/api/admin/users/${encodeURIComponent(user.id)}`,
        payload
      );

      const updated = res.data;
      alert("회원 정보가 수정되었습니다.");

      // 화면에 보이는 정보도 최신으로 반영
      setUser(updated);
      setForm((prev) => ({
        ...prev,
        name: updated.name || "",
        nickname: updated.nickname || "",
        userType: updated.userType || "NORMAL",
        newPassword: "", // 저장 후 비밀번호 입력칸 비우기
      }));
    } catch (err) {
      console.error("❌ 회원 정보 수정 실패:", err);
      alert("회원 정보 수정 중 오류가 발생했습니다.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>로딩 중...</div>;
  }

  if (!user) {
    return (
      <div style={{ padding: 20 }}>
        해당 회원 정보를 찾을 수 없습니다.
        <br />
        <button onClick={() => navigate("/admin/users")}>회원 목록으로</button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 600, margin: "40px auto", color: "#f5f5f5" }}>
      <h2>회원 정보</h2>

      <form
        onSubmit={handleSubmit}
        style={{
          border: "1px solid #444",
          borderRadius: 8,
          padding: 16,
          marginTop: 16,
          backgroundColor: "#1e1e1e",
        }}
      >
        <p>
          <strong>아이디:</strong> {user.id}
        </p>

        {/* 이름 수정 */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>이름</label>
          <input
            type="text"
            value={form.name}
            onChange={handleChange("name")}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* 닉네임 수정 (지금은 서버에서 안 쓰더라도 폼은 미리 만들어 둠) */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>닉네임</label>
          <input
            type="text"
            value={form.nickname}
            onChange={handleChange("nickname")}
            style={{ width: "100%", padding: 8 }}
          />
        </div>

        {/* 직책/권한 수정 */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>직책(권한)</label>
          <select
            value={form.userType}
            onChange={handleChange("userType")}
            style={{ width: "100%", padding: 8 }}
          >
            <option value="NORMAL">일반회원</option>
            <option value="GUEST">비회원</option>
            <option value="ADMIN">관리자</option>
            <option value="KAKAO">카카오</option>
          </select>
        </div>

        {/* 새 비밀번호 (선택 입력) */}
        <div style={{ marginTop: 12 }}>
          <label style={{ display: "block", marginBottom: 4 }}>
            새 비밀번호 (선택)
          </label>
          <input
            type="password"
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            style={{ width: "100%", padding: 8 }}
            placeholder="변경하지 않으려면 비워두세요"
          />
          <small style={{ opacity: 0.7 }}>
            비워두면 비밀번호는 변경되지 않습니다. (길이 제한 없음)
          </small>
        </div>

        <div
          style={{
            marginTop: 20,
            display: "flex",
            justifyContent: "flex-end",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => navigate("/admin/users")}
            disabled={saving}
          >
            목록으로
          </button>
          <button type="submit" disabled={saving}>
            {saving ? "저장 중..." : "저장"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default AdminUserInfo;
