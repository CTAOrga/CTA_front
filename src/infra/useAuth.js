import { useContext } from "react";
import AuthContext from "./auth-context.js";

export default function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === null) {
    throw new Error(
      "useAuth() debe usarse dentro de <AuthProvider>. Verifica main.jsx."
    );
  }
  return ctx;
}
