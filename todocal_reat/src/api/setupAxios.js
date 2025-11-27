import axios from "axios";

const BASE_URL = (import.meta?.env?.VITE_API_BASE_URL || "").replace(/\/$/, "");

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
