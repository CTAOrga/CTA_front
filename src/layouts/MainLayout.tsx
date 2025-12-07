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
  Stack,
  Button,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import InboxIcon from "@mui/icons-material/Inbox";
import InfoIcon from "@mui/icons-material/Info";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import RateReviewIcon from "@mui/icons-material/RateReview";
import FavoriteIcon from "@mui/icons-material/Favorite";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import PeopleIcon from "@mui/icons-material/People";
import LightModeIcon from "@mui/icons-material/LightMode";
import DirectionsCarIcon from "@mui/icons-material/DirectionsCar";
import CarRentalIcon from "@mui/icons-material/CarRental";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import LoginIcon from "@mui/icons-material/Login";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import ShoppingBagIcon from "@mui/icons-material/ShoppingBag";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import BusinessIcon from "@mui/icons-material/Business";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import useAuth from "../infra/useAuth";
const drawerWidth = 240;

const getPrimaryRole = (roles = []) => {
  const L = roles.map((r) => String(r).toLowerCase());
  if (L.includes("admin")) return "admin";
  if (L.includes("buyer")) return "buyer";
  if (L.includes("agency")) return "agency";
  return "guest";
};

export default function MainLayout({
  children,
  title = "Dashboard",
  mode = "light",
  toggleMode = () => {},
}) {
  const theme = useTheme();
  const mdUp = useMediaQuery(theme.breakpoints.up("md"));
  const [open, setOpen] = React.useState(false);
  //const { hasRole } = useAuth() || {};
  const toggle = () => setOpen((v) => !v);
  const { isAuthenticated, logout, user, hasRole } = useAuth() || {};
  const navigate = useNavigate();

  const { roles = [] } = useAuth();
  const primaryRole = getPrimaryRole(roles);

  console.log("Prymary role:", primaryRole);

  const handleLogin = () => navigate("/login");
  const handleSignUp = () => navigate("/register"); // ajustá la ruta si usás /signup
  const handleLogout = () => {
    logout?.();
    navigate("/");
  };

  const homeLabel = primaryRole === "admin" ? "Reportes" : "Inicio";

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
          <ListItemText primary={homeLabel} />
        </ListItemButton>
        {hasRole?.("admin") && (
          <>
            <ListItemButton component={RouterLink} to='/admin/agencies/new'>
              <ListItemIcon>
                <BusinessIcon />
              </ListItemIcon>
              <ListItemText primary='Nueva agencia' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/admin/users'>
              <ListItemIcon>
                <PeopleIcon />
              </ListItemIcon>
              <ListItemText primary='Usuarios' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/admin/reviews'>
              <ListItemIcon>
                <RateReviewIcon />
              </ListItemIcon>
              <ListItemText primary='Reseñas' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/admin/favorites'>
              <ListItemIcon>
                <DirectionsCarIcon />
              </ListItemIcon>
              <ListItemText primary='Autos de interés' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/admin/purchases'>
              <ListItemIcon>
                <ReceiptLongIcon />
              </ListItemIcon>
              <ListItemText primary='Compras' />
            </ListItemButton>
          </>
        )}
        {hasRole?.("buyer") && (
          <>
            <ListItemButton component={RouterLink} to='/my-purchases'>
              <ListItemIcon>
                <ShoppingBagIcon />
              </ListItemIcon>
              <ListItemText primary='Mis compras' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/my-favorites'>
              <ListItemIcon>
                <FavoriteIcon />
              </ListItemIcon>
              <ListItemText primary='Mis favoritos' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/my-reviews'>
              <ListItemIcon>
                <RateReviewIcon />
              </ListItemIcon>
              <ListItemText primary='Mis reseñas' />
            </ListItemButton>
          </>
        )}
        {hasRole?.("agency") && (
          <>
            <ListItemButton component={RouterLink} to='/agencies/listings/new'>
              <ListItemIcon>
                <AddCircleOutlineIcon />
              </ListItemIcon>
              <ListItemText primary='Crear publicación' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/agencies/sales'>
              <ListItemIcon>
                <ShoppingBagIcon />
              </ListItemIcon>
              <ListItemText primary='Mis ventas' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/agencies/customers'>
              <ListItemIcon>
                <PersonAddIcon />
              </ListItemIcon>
              <ListItemText primary='Mis clientes' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/agencies/inventory'>
              <ListItemIcon>
                <DirectionsCarIcon />
              </ListItemIcon>
              <ListItemText primary='Inventario' />
            </ListItemButton>
            <ListItemButton component={RouterLink} to='/agencies/inventory/new'>
              <ListItemIcon>
                <CarRentalIcon />
              </ListItemIcon>
              <ListItemText primary='Nuevo ítem inventario' />
            </ListItemButton>
          </>
        )}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      {/* Footer del sidebar: toggle de tema + versión */}
      <Divider />
      <Box sx={{ p: 1.5, display: "flex", alignItems: "center" }}>
        <IconButton
          onClick={toggleMode}
          aria-label='Alternar tema'
          title={mode === "light" ? "Cambiar a oscuro" : "Cambiar a claro"}
          size='small'
          sx={{ mr: 1 }}
        >
          {mode === "light" ? (
            <DarkModeIcon fontSize='small' />
          ) : (
            <LightModeIcon fontSize='small' />
          )}
        </IconButton>
        <Typography variant='body2'>
          {mode === "light" ? "Claro" : "Oscuro"}
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
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
      <AppBar
        position='fixed'
        color='primary'
        enableColorOnDark
        data-testid='top-app-bar'
        sx={{
          zIndex: (t) => t.zIndex.drawer + 1,
          transition: (t) =>
            t.transitions.create("background-color", {
              duration: t.transitions.duration.standard,
            }),
        }}
      >
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
          {/* TÍTULO CENTRADO ABSOLUTO */}
          <Typography
            variant='h6'
            noWrap
            sx={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              textAlign: "center",
              pointerEvents: "none", // no bloquea clicks de atrás
            }}
          >
            {title}
          </Typography>

          {/* empuja acciones a la derecha */}
          <Box sx={{ flexGrow: 1 }} />
          {/* Botones de auth */}
          <Stack direction='row' spacing={1}>
            {!isAuthenticated ? (
              <>
                <Button
                  color='inherit'
                  startIcon={<LoginIcon />}
                  onClick={handleLogin}
                >
                  Log In
                </Button>
                <Button
                  color='inherit'
                  startIcon={<PersonAddIcon />}
                  onClick={handleSignUp}
                >
                  Sign Up
                </Button>
              </>
            ) : (
              <Button
                color='inherit'
                startIcon={<LogoutIcon />}
                onClick={handleLogout}
              >
                Log Out
              </Button>
            )}
          </Stack>
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
