import { Button, Paper, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function NotFoundPage() {
  const nav = useNavigate();

  return (
    <Paper sx={{ p: 4, maxWidth: 600, mx: "auto", mt: 8 }}>
      <Stack spacing={2}>
        <Typography variant='h4' gutterBottom>
          Página no encontrada
        </Typography>
        <Typography variant='body1'>
          La ruta que intentaste visitar no existe. Verificá la URL o volvé al
          inicio.
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button variant='contained' onClick={() => nav("/")}>
            Ir al inicio
          </Button>
          <Button variant='outlined' onClick={() => nav("/login")}>
            Ir a iniciar sesión
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
