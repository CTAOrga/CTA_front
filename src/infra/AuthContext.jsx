// src/infra/AuthContext.jsx
import React, { useEffect, useMemo, useState } from "react";
import AuthContext from "./auth-context.js";
import { login as apiLogin, clearToken, getSession } from "./authService";

export default function AuthProvider({ children }) {
  const [session, setSession] = useState(() => getSession());

  useEffect(() => {}, []);

  const login = async (email, password) => {
    const s = await apiLogin(email, password);
    console.log("[Login] session:", s);
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
