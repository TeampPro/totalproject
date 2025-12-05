// src/api/http.js

// .env 의 VITE_API_BASE_URL 사용 (마지막 / 제거)
const BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

// 쿼리 스트링 빌더
function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) return path;
  const search = new URLSearchParams(params).toString();
  return path.includes("?") ? `${path}&${search}` : `${path}?${search}`;
}

// 401(인증 만료) 공통 처리 함수
function handleUnauthorized() {
  try {
    // 클라이언트 측 로그인 정보 제거
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  } catch (e) {
    console.error("로컬 스토리지 삭제 중 오류:", e);
  }

  // 사용자에게 안내
  window.alert(
    "로그인 세션이 만료되어 자동 로그아웃되었습니다. 다시 로그인 해주세요."
  );

  // 홈 화면으로 이동
  if (window.location.pathname !== "/main") {
    window.location.href = "/main";
  }
}

// 실제 fetch 래퍼
export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  // FormData 가 아닐 때만 JSON Content-Type 설정
  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  // 토큰이 있으면 Authorization 헤더 추가
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", // 쿠키 등 포함
  });

  // 응답 body 파싱
  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  // 에러 처리
  if (!res.ok) {
    // 🔥 401 이면 자동 로그아웃 + 홈 이동
    if (res.status === 401) {
      handleUnauthorized();
    }

    const message =
      (data && data.message) || `요청 실패 (${res.status} ${res.statusText})`;

    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

// 사용하기 편한 http 메서드 래퍼
export const api = {
  get: (path, options = {}) => {
    const { params, ...rest } = options;
    return apiFetch(buildUrl(path, params), { method: "GET", ...rest });
  },

  post: (path, body, options = {}) =>
    apiFetch(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  put: (path, body, options = {}) =>
    apiFetch(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
      ...options,
    }),

  del: (path, options = {}) => {
    const { params, ...rest } = options;
    return apiFetch(buildUrl(path, params), { method: "DELETE", ...rest });
  },
};
