import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000",
});

// Adjunta Bearer <token> si existe
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Manejo básico de 401 (opcional: refresh/logout)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err?.response?.status === 401) {
      // TODO: intentá refresh o forzá logout
      // window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default http;
