export const FALLBACK_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://overstraightly-nonverbalized-ciera.ngrok-free.dev"
    : "http://localhost:8080";

export const BASE_URL = (
  import.meta?.env?.VITE_API_BASE_URL ||
  FALLBACK_BASE_URL
).replace(/\/$/, "");

function buildUrl(path, params) {
  if (!params || Object.keys(params).length === 0) return path;
  const search = new URLSearchParams(params).toString();
  return path.includes("?") ? `${path}&${search}` : `${path}?${search}`;
}

export async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token"); 
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(options.headers || {}),
  };

  if (!isFormData && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`; 
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    credentials: "include", 
  });

  let data;
  const text = await res.text();
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message =
      (data && data.message) ||
      `요청 실패 (${res.status} ${res.statusText})`;
    const error = new Error(message);
    error.status = res.status;
    error.data = data;
    throw error;
  }

  return data;
}

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