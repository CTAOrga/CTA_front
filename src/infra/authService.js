import http from "./http";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "access_token";

export async function login(email, password) {
  const { data } = await http.post("/auth/login", { email, password });
  const { token } = data; // <-- el backend debe devolver { token }
  setToken(token);
  return getSession(); // devuelve { user, roles, exp }
}

export async function register(payload) {
  const { data } = await http.post("/auth/register", payload);
  return data;
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function decodeToken(token = getToken()) {
  if (!token) return null;
  try {
    const d = jwtDecode(token);
    return {
      sub: d.sub,
      roles: d.roles || d.role || [],
      exp: d.exp,
      raw: d,
    };
  } catch {
    return null;
  }
}
export function isExpired(token = getToken()) {
  const d = decodeToken(token);
  return d?.exp ? Date.now() >= d.exp * 1000 : false;
}
export function getSession() {
  const d = decodeToken();
  if (!d) return null;
  return { user: { id: d.sub }, roles: d.roles, exp: d.exp };
}
