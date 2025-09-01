import React, { useState } from "react";
import {
  Paper,
  Stack,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { createAgencyAdmin } from "../infra/agencyService.js";

export default function AgencyCreate() {
  const [agencyName, setAgencyName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [ok, setOk] = useState(null);
  const nav = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    if (!agencyName.trim())
      return setError("El nombre de la agencia es requerido");
    if (!email.trim()) return setError("El email es requerido");
    if (password.length < 6)
      return setError("La contraseña debe tener al menos 6 caracteres");
    if (password !== confirm) return setError("Las contraseñas no coinciden");

    try {
      setLoading(true);
      const res = await createAgencyAdmin({ agencyName, email, password });
      setOk("Agencia y usuario admin creados correctamente");
      // Si querés volver al dashboard luego de 1.2s:
      setTimeout(() => nav("/"), 1200);
      // opcional: console.log('API result:', res);
    } catch (err) {
      const msg = err?.response?.data?.message || "No se pudo crear la agencia";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 560, mx: "auto", mt: 4 }}>
      <Typography variant='h6' gutterBottom>
        Crear agencia (usuario Admin)
      </Typography>
      <form onSubmit={onSubmit}>
        <Stack spacing={2}>
          <TextField
            label='Nombre de la agencia'
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            required
          />
          <TextField
            label='Email del admin'
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type='email'
            required
          />
          <TextField
            label='Contraseña'
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type='password'
            required
            helperText='Mínimo 6 caracteres'
          />
          <TextField
            label='Confirmar contraseña'
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            type='password'
            required
          />

          {error && <Alert severity='error'>{error}</Alert>}
          {ok && <Alert severity='success'>{ok}</Alert>}

          <Stack direction='row' spacing={1}>
            <Button type='submit' variant='contained' disabled={loading}>
              {loading ? <CircularProgress size={20} /> : "Crear"}
            </Button>
            <Button
              variant='outlined'
              onClick={() => nav(-1)}
              disabled={loading}
            >
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </form>
    </Paper>
  );
}
