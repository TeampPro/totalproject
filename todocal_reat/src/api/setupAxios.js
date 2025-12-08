import axios from "axios";

const FALLBACK_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://overstraightly-nonverbalized-ciera.ngrok-free.dev"
    : "http://localhost:8080";

const BASE_URL = (
  import.meta?.env?.VITE_API_BASE_URL ||
  FALLBACK_BASE_URL
).replace(/\/$/, "");

console.log("BASE_URL (axios) =", BASE_URL); // 확인용, 나중에 지워도 됨

axios.defaults.baseURL = BASE_URL || undefined;
axios.defaults.withCredentials = true;

// 나머지 인터셉터 코드는 그대로


axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default axios;
