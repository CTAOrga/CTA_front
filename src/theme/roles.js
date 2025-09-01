// Paletas por rol: admin, buyer, agency y guest (no logueado)
const GUEST = {
  palette: {
    primary: { main: "#607d8b" }, // blue-grey
    secondary: { main: "#90a4ae" },
  },
};
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
  buyer: {
    palette: {
      primary: { main: "#2e7d32" }, // verde
      secondary: { main: "#0288d1" }, // celeste
    },
  },
  agency: {
    palette: {
      primary: { main: "#1976d2" }, // azul
      secondary: { main: "#9c27b0" }, // violeta
    },
  },
  guest: GUEST,
  // alias por compatibilidad si en algún lado quedó "viewer"
  viewer: GUEST,
};

// (opcional) export default por conveniencia
export default ROLE_TOKENS;
