import axios from "axios";

/**
 * Base URL öncelik sırası:
 * 1) VITE_API_URL (örn: https://qr-menu-api.onrender.com)
 * 2) Geliştirme varsayılanı: http://localhost:4000
 */

const BASE_URL = import.meta.env?.VITE_API_URL || "http://localhost:4000";

/**
 * Token yönetimi (basit localStorage)
 * - Prod’da HttpOnly cookie tercih edilir; derste basitlik için localStorage kullanıyoruz.
 */

const TOKEN_KEY = "qm_token";
export function setAuthToken(token) {
  if (token) {
    localStorage.setItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

export function getAuthToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export const http = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

// Request interceptor → Authorization
http.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Beraer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor → Hata mesajını sadeleştir

http.interceptors.response.use(
  (res) => res,
  (error) => {
    // Backend genelde { error: "mesaj" } döndürüyor
    const message =
      error?.response?.data?.error ||
      error?.message ||
      "Beklenmeyen bir hata oluştu";
    // İstersen burada toast gösterimini ekleyebiliriz.
    // (Bu dosyada UI bağımlılığı eklemiyoruz.)
    return Promise.reject(new Error(message));
  }
);
export default http;
