import React, { useMemo, useState, useEffect } from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import buildTheme from "./index.js";

export default function ThemeController({
  role = "viewer",
  initialMode = "light",
  children,
}) {
  const [mode, setMode] = useState(initialMode);

  // Persistir preferencia de modo por rol (opcional)
  useEffect(() => {
    const saved = localStorage.getItem(`mode:${role}`);
    if (saved === "light" || saved === "dark") setMode(saved);
  }, [role]);

  const theme = useMemo(() => buildTheme({ role, mode }), [role, mode]);

  const toggleMode = () => {
    setMode((m) => {
      const next = m === "light" ? "dark" : "light";
      localStorage.setItem(`mode:${role}`, next);
      return next;
    });
  };

  // Patrón "render prop": children puede recibir helpers
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {typeof children === "function"
        ? children({ mode, toggleMode })
        : children}
    </ThemeProvider>
  );
}
