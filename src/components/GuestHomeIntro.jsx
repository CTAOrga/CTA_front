import { Stack, Typography, Paper, Chip, Alert, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function GuestHomeIntro({ ui }) {
  return (
    <Stack spacing={3}>
      <Typography variant='h4' component='h1'>
        {"Bienvenido 👋"}
      </Typography>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            label={`Rol: ${ui.label}`}
            color={ui.color}
            variant='outlined'
          />
          <Chip label='Invitado' variant='outlined' />
        </Stack>

        <Typography sx={{ mt: 2 }}>{ui.message}</Typography>

        <Alert severity='info' sx={{ mt: 2 }}>
          Para acceder a tus módulos,&nbsp;
          <Button component={RouterLink} to='/login' size='small'>
            iniciá sesión
          </Button>
          &nbsp;o&nbsp;
          <Button component={RouterLink} to='/register' size='small'>
            creá tu cuenta
          </Button>
        </Alert>
      </Paper>
    </Stack>
  );
}
