import { Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function ForbiddenPage() {
  const nav = useNavigate();

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant='h4' gutterBottom>
          No tenés permisos
        </Typography>
        <Typography variant='body1'>
          Estás autenticado, pero tu usuario no tiene permisos para acceder a
          esta sección.
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button variant='contained' onClick={() => nav("/")}>
            Volver al inicio
          </Button>
          <Button variant='outlined' onClick={() => nav("/login")}>
            Cambiar de usuario
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
