import React, { useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import buildTheme from "./index.js";

const STORAGE_KEY = "theme:mode";

function getInitialMode(role, initialMode) {
  try {
    // 1) Si ya existe la preferencia global, úsala
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "light" || saved === "dark") return saved;

    // 2) MIGRACIÓN (una sola vez): si antes guardabas por rol, respétalo
    const legacyKeys = [
      `mode:${role}`,
      "mode:admin",
      "mode:buyer",
      "mode:agency",
      "mode:guest",
    ];
    for (const k of legacyKeys) {
      const v = localStorage.getItem(k);
      if (v === "light" || v === "dark") return v;
    }

    // 3) Si no hay nada guardado, usa initialMode o la preferencia del SO
    if (initialMode === "light" || initialMode === "dark") return initialMode;
    if (
      typeof window !== "undefined" &&
      window.matchMedia?.("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
  } catch {
    // ignorar errores de localStorage
  }
  return "light";
}

export default function ThemeController({
  role = "guest",
  initialMode = "light",
  children,
}) {
  const [mode, setMode] = useState(() => getInitialMode(role, initialMode));

  // Persistir SIEMPRE en la clave global
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, mode);
    } catch {}
  }, [mode]);

  // (Opcional) limpiar claves viejas una vez
  useEffect(() => {
    try {
      [
        "mode:admin",
        "mode:buyer",
        "mode:agency",
        "mode:guest",
        `mode:${role}`,
      ].forEach((k) => localStorage.removeItem(k));
    } catch {}
    // solo on-mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const theme = useMemo(() => buildTheme({ role, mode }), [role, mode]);

  const toggleMode = () => {
    setMode((m) => (m === "light" ? "dark" : "light"));
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {typeof children === "function"
        ? children({ mode, toggleMode })
        : children}
    </ThemeProvider>
  );
}
