import React, { useState } from "react";
import { TextField, Button, Stack, Typography, Paper } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";
import useAuth from "../infra/useAuth.js";

export default function Login() {
  const [email, setEmail] = useState("admin@mail.com");
  const [password, setPassword] = useState("123456");
  const [error, setError] = useState(null);
  const { login } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      nav(state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError("Credenciales inválidas");
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 420, mx: "auto", mt: 8 }}>
      <Typography variant='h6' gutterBottom>
        Iniciar sesión
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
            Entrar
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
