import axios from "axios";

const FALLBACK_BASE_URL =
  import.meta.env.MODE === "production"
    ? "https://overstraightly-nonverbalized-ciera.ngrok-free.dev"
    : "http://localhost:8080";

const BASE_URL = (
  import.meta?.env?.VITE_API_BASE_URL ||
  FALLBACK_BASE_URL
).replace(/\/$/, "");

axios.defaults.baseURL = BASE_URL || undefined;
axios.defaults.withCredentials = true;

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
