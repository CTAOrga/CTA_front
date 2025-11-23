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

// Manejo básico de 401 (token vencido / inválido)
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      // Si hay token guardado, asumimos que la sesión estaba activa
      const token = localStorage.getItem("access_token");
      if (token) {
        // limpiamos token
        localStorage.removeItem("access_token");

        // opcional: podrías limpiar otras cosas si en el futuro guardás más info

        // si no estamos ya en /login, redirigimos
        if (window.location.pathname !== "/login") {
          window.location.href = "/login";
        }
      }
    }

    // Para 403 u otros códigos, no tocamos nada:
    // - 403 real (rol incorrecto) → sigue mostrando "Prohibido"
    // - otros errores se manejarán en cada pantalla
    return Promise.reject(err);
  }
);

export default http;
