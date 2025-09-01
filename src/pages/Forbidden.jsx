import React from "react";
import { Stack, Typography, Button } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function Forbidden() {
  return (
    <Stack spacing={2} alignItems='center' sx={{ mt: 8 }}>
      <Typography variant='h4'>403 — Acceso denegado</Typography>
      <Typography color='text.secondary'>
        No tenés permisos para ver esta página.
      </Typography>
      <Button variant='contained' component={RouterLink} to='/'>
        Volver al inicio
      </Button>
    </Stack>
  );
}
