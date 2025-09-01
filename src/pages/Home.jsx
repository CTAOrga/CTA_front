import React, { useMemo } from "react";
import { Typography, Button, Stack, Paper, Chip, Alert } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";
import useAuth from "../infra/useAuth.js";

// Decide un rol “principal” a partir del array de roles
const getPrimaryRole = (roles = []) => {
  const L = roles.map((r) => String(r).toLowerCase());
  if (L.includes("admin")) return "admin";
  if (L.includes("buyer")) return "buyer";
  if (L.includes("agency")) return "agency";
  return "guest";
};

// Texto/color por rol
const ROLE_UI = {
  admin: {
    label: "Administrador",
    color: "secondary",
    message: "Tenés acceso completo al panel.",
  },
  buyer: {
    label: "Compras",
    color: "success",
    message: "Gestioná órdenes y compras.",
  },
  agency: {
    label: "Agencia",
    color: "warning",
    message: "Accedé a las funciones de agencia.",
  },
  guest: {
    label: "Invitado",
    color: "default",
    message: "Estás en modo invitado. Iniciá sesión para más funciones.",
  },
};

export default function Home() {
  const { isAuthenticated, user, roles = [] } = useAuth();
  const role = useMemo(() => getPrimaryRole(roles), [roles]);
  const ui = ROLE_UI[role];
  return (
    <Stack spacing={3}>
      <Typography variant='h4' component='h1'>
        {isAuthenticated
          ? `¡Bienvenido${user?.id ? ` #${user.id}` : ""}!`
          : "Bienvenido 👋"}
      </Typography>

      <Paper variant='outlined' sx={{ p: 2 }}>
        <Stack direction='row' spacing={1} alignItems='center'>
          <Chip
            label={`Rol: ${ui.label}`}
            color={ui.color}
            variant={role === "guest" ? "outlined" : "filled"}
          />
          {isAuthenticated ? (
            <Chip label='Autenticado' color='primary' variant='outlined' />
          ) : (
            <Chip label='Invitado' variant='outlined' />
          )}
        </Stack>

        <Typography sx={{ mt: 2 }}>{ui.message}</Typography>

        {!isAuthenticated && (
          <Alert severity='info' sx={{ mt: 2 }}>
            Para acceder a tus módulos,&nbsp;
            <Button component={RouterLink} to='/login' size='small'>
              iniciá sesión
            </Button>
            &nbsp;o&nbsp;
            <Button component={RouterLink} to='/register' size='small'>
              creá tu cuenta
            </Button>
            .
          </Alert>
        )}
      </Paper>
    </Stack>
  );
}
