// src/infra/AuthContext.jsx
import React, { createContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, clearToken, getSession } from "./authService";

export const AuthContext = createContext(null);

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession()); // { user, roles, exp } | null

  useEffect(() => {
    // si querés validar expiración aquí...
  }, []);

  const login = async (email, password) => {
    const s = await apiLogin(email, password);
    setSession(s);
    return s;
  };

  const logout = () => {
    clearToken();
    setSession(null);
  };

  const hasRole = (r) => !!session?.roles?.includes(r);

  const value = useMemo(
    () => ({
      isAuthenticated: !!session,
      user: session?.user || null,
      roles: session?.roles || [],
      login,
      logout,
      hasRole,
    }),
    [session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
