import {
  Grid,
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RefreshIcon from "@mui/icons-material/Refresh";
import InsightsIcon from "@mui/icons-material/Insights";
import AssignmentIcon from "@mui/icons-material/Assignment";

export default function Home() {
  return (
    <Stack spacing={3}>
      {/* Encabezado */}
      <Typography variant='h4' component='h1'>
        Bienvenido 👋
      </Typography>
      <Typography variant='body1' color='text.secondary'>
        Esto es una página principal básica con MUI. Personalizá las cards con
        tus datos reales.
      </Typography>

      {/* Stats / Resumen rápido */}
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='overline' color='text.secondary'>
              Usuarios activos
            </Typography>
            <Typography variant='h5'>128</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='overline' color='text.secondary'>
              Pendientes
            </Typography>
            <Typography variant='h5'>14</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='overline' color='text.secondary'>
              Tareas hoy
            </Typography>
            <Typography variant='h5'>6</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper variant='outlined' sx={{ p: 2 }}>
            <Typography variant='overline' color='text.secondary'>
              Errores
            </Typography>
            <Typography variant='h5'>0</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Card de acciones */}
      <Card>
        <CardContent>
          <Typography variant='h6'>Acciones rápidas</Typography>
          <Typography variant='body2' color='text.secondary'>
            Atajos comunes del día a día.
          </Typography>
          <Divider sx={{ my: 2 }} />
          <Stack direction='row' spacing={1} useFlexGap flexWrap='wrap'>
            <Button
              variant='contained'
              startIcon={<AddIcon />}
              onClick={() => alert("Crear…")}
            >
              Crear item
            </Button>
            <Button
              variant='outlined'
              startIcon={<RefreshIcon />}
              onClick={() => alert("Refrescar…")}
            >
              Refrescar
            </Button>
            <Button
              variant='outlined'
              startIcon={<InsightsIcon />}
              onClick={() => alert("Ver métricas…")}
            >
              Métricas
            </Button>
            <Button
              variant='outlined'
              startIcon={<AssignmentIcon />}
              onClick={() => alert("Ir a tareas…")}
            >
              Tareas
            </Button>
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button size='small' onClick={() => alert("Ver todo")}>
            Ver todo
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
