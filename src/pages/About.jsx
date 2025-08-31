import {
  Stack,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Link,
} from "@mui/material";
import InfoIcon from "@mui/icons-material/Info";
import CodeIcon from "@mui/icons-material/Code";
import PublicIcon from "@mui/icons-material/Public";

export default function About() {
  const apiUrl = import.meta.env.VITE_API_URL || "No configurada";

  return (
    <Stack spacing={3}>
      <Typography variant='h4' component='h1'>
        Acerca de la app
      </Typography>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack direction='row' spacing={2} alignItems='center'>
          <Chip label='React + Vite + MUI' color='primary' variant='outlined' />
          <Chip label='JS (sin TS)' variant='outlined' />
          <Chip label='v1.0' size='small' />
        </Stack>

        <Divider sx={{ my: 2 }} />

        <Typography variant='body1' sx={{ mb: 1 }}>
          Esta es una página “About” básica. Acá podés listar la versión, el
          commit, enlaces a la documentación, etc.
        </Typography>

        <List dense>
          <ListItem>
            <ListItemIcon>
              <InfoIcon />
            </ListItemIcon>
            <ListItemText
              primary='Descripción'
              secondary='Frontend base con layout (AppBar + Drawer), theming dinámico y páginas de ejemplo.'
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <CodeIcon />
            </ListItemIcon>
            <ListItemText
              primary='Stack'
              secondary='React 18, Vite 6, MUI v5, React Router'
            />
          </ListItem>
          <ListItem>
            <ListItemIcon>
              <PublicIcon />
            </ListItemIcon>
            <ListItemText primary='API URL' secondary={apiUrl} />
          </ListItem>
        </List>

        <Typography variant='body2' color='text.secondary'>
          Repositorio:{" "}
          <Link
            href='https://github.com/'
            target='_blank'
            rel='noopener noreferrer'
          >
            (poné aquí el link real)
          </Link>
        </Typography>
      </Paper>
    </Stack>
  );
}
