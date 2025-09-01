import http from "./http";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "access_token";

const normalizeRoles = (decodedRoleOrRoles) => {
  if (!decodedRoleOrRoles) return [];
  return Array.isArray(decodedRoleOrRoles)
    ? decodedRoleOrRoles
    : [String(decodedRoleOrRoles)];
};

export async function login(email, password) {
  const { data } = await http.post("/auth/login", { email, password });
  console.log("Data:", data);
  //const { token } = data; // <-- el backend debe devolver { token }
  const token = data?.access_token || data?.token;
  if (!token) throw new Error("No llegó access_token en el login");
  setToken(token);
  // Construimos la sesión decodificando el JWT
  const session = getSession();

  // Si la API además mandó role/agency_id, los integramos (por si el JWT no los trajera)
  if (session) {
    // `role` puede venir como string; lo normalizamos a array
    const apiRoles = normalizeRoles(data?.role);
    // combinamos sin duplicados por las dudas
    const merged = Array.from(new Set([...(session.roles || []), ...apiRoles]));
    session.roles = merged;
    if (data?.agency_id !== undefined) {
      session.agencyId = data.agency_id;
    }
  }

  return session;
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
  console.log("getSession decoded:", d);
  if (!d) return null;
  return { user: { id: d.sub }, roles: [d.roles], exp: d.exp };
}
