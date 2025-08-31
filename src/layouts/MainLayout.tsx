// src/layouts/MainLayout.jsx
import React from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  CssBaseline,
  Divider,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/Inbox";
import InfoIcon from "@mui/icons-material/Info";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import LightModeIcon from "@mui/icons-material/LightMode";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import { Link as RouterLink } from "react-router-dom";

const drawerWidth = 240;

export default function MainLayout({
  children,
  title = "Dashboard",
  mode = "light",
  toggleMode = () => {},
}) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);
  const toggle = () => setOpen((v) => !v);

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <Toolbar>
        <Typography variant='h6' noWrap>
          CTA Front
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        <ListItemButton component={RouterLink} to='/'>
          <ListItemIcon>
            <InboxIcon />
          </ListItemIcon>
          <ListItemText primary='Inicio' />
        </ListItemButton>
        <ListItemButton component={RouterLink} to='/about'>
          <ListItemIcon>
            <InfoIcon />
          </ListItemIcon>
          <ListItemText primary='Acerca' />
        </ListItemButton>
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Divider />
      <Box sx={{ p: 2 }}>
        <Typography variant='caption' color='text.secondary'>
          v1.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      {/* TopBar */}
      <AppBar position='fixed' sx={{ zIndex: (t) => t.zIndex.drawer + 1 }}>
        <Toolbar>
          {!mdUp && (
            <IconButton
              color='inherit'
              edge='start'
              onClick={toggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant='h6' noWrap sx={{ flexGrow: 1 }}>
            {title}
          </Typography>

          {/* Toggle claro/oscuro */}
          <IconButton
            color='inherit'
            onClick={toggleMode}
            aria-label='Alternar tema'
            title={mode === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
          >
            {mode === "light" ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
        </Toolbar>
      </AppBar>

      {/* SideBar */}
      <Box
        component='nav'
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant='temporary'
          open={open}
          onClose={toggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", md: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant='permanent'
          open
          sx={{
            display: { xs: "none", md: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              boxSizing: "border-box",
            },
          }}
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Contenido */}
      <Box component='main' sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar /> {/* offset bajo AppBar */}
        {children}
      </Box>
    </Box>
  );
}
