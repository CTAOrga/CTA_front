// src/theme/roles.js
// Paletas y overrides por rol. Podés ajustar colores/overrides a gusto.
export const ROLE_TOKENS = {
  admin: {
    palette: {
      primary: { main: "#7b1fa2" }, // púrpura
      secondary: { main: "#ff7043" }, // naranja
    },
    components: {
      // Ejemplo: botones más redondeados solo para admin
      MuiButton: {
        styleOverrides: {
          root: { borderRadius: 999 },
        },
      },
    },
  },
  editor: {
    palette: {
      primary: { main: "#2e7d32" }, // verde
      secondary: { main: "#0288d1" }, // celeste
    },
  },
  viewer: {
    palette: {
      primary: { main: "#1976d2" }, // azul
      secondary: { main: "#9c27b0" }, // violeta
    },
  },
};

// (opcional) export default por conveniencia
export default ROLE_TOKENS;
