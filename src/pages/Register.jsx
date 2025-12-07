import React, { useState } from "react";
import { TextField, Button, Stack, Typography, Paper } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { register as apiRegister } from "../infra/authService";
import useAuth from "../infra/useAuth.js";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const nav = useNavigate();
  const { login } = useAuth();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await apiRegister({ email, password });
      const session = await login(email, password);
      console.log("[Register] session:", session);
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
            slotProps={{
              htmlInput: { "data-testid": "register-email" },
            }}
          />
          <TextField
            label='Password'
            type='password'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            slotProps={{
              htmlInput: { "data-testid": "register-password" },
            }}
          />
          {error && <Typography color='error'>{error}</Typography>}
          <Button
            type='submit'
            variant='contained'
            data-testid='register-submit'
          >
            Registrarme
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
