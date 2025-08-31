// src/theme/index.js
import { createTheme } from "@mui/material/styles";
import { deepmerge } from "@mui/utils";
import { ROLE_TOKENS } from "./roles.js"; // asegúrate de que roles.js exista

const baseTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === "light"
      ? { background: { default: "#fafafb", paper: "#ffffff" } }
      : { background: { default: "#121212", paper: "#1e1e1e" } }),
  },
  shape: { borderRadius: 12 },
  typography: {
    fontFamily: '"Roboto","Helvetica","Arial",sans-serif',
  },
});

export default function buildTheme({ role = "viewer", mode = "light" } = {}) {
  const base = baseTokens(mode);
  const roleTokens = ROLE_TOKENS[role] ?? ROLE_TOKENS.viewer;
  const merged = deepmerge(base, roleTokens);
  return createTheme(merged);
}
