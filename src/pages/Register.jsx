import React, { useState } from "react";
import { TextField, Button, Stack, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  register as apiRegister,
  login as apiLogin,
} from "../infra/authService";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiRegister({ email, password });
      // opcional: loguear directo luego de registrar
      await apiLogin(email, password);
      nav("/", { replace: true });
    } catch (err) {
      setError("No se pudo registrar");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: "auto", mt: 8 }}>
      <Typography variant='h6' gutterBottom>
        Crear cuenta
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <TextField
            label='Email'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color='error'>{error}</Typography>}
          <Button type='submit' variant='contained'>
            Registrarme
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
