import axios from "axios";

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000";
const TOKEN_KEY = "qm_token";

export function setAuthToken(token) {
  try {
    if (typeof token === "string" && token.trim()) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.error("localStorage error:", e);
  }
}

export function getAuthToken() {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export const http = axios.create({ baseURL: BASE_URL, timeout: 15000 });

http.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default http;