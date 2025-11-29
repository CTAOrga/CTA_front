import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  Button,
} from "@mui/material";
import { getMySales } from "../infra/agencySalesService";

export default function AgencySales() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false); // arranca en false
  const [error, setError] = useState("");

  // 🔹 Filtros
  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [customer, setCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      // validar rango de fechas antes de pegarle al back
      if (dateFrom && dateTo && dateFrom > dateTo) {
        setError('"Desde" no puede ser mayor que "Hasta"');
        setRows([]);
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const data = await getMySales({
          brand: brand || undefined,
          model: model || undefined,
          customer: customer || undefined,
          dateFrom: dateFrom || undefined, // "YYYY-MM-DD"
          dateTo: dateTo || undefined,
        });

        if (!cancelled) {
          setRows(data || []);
        }
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("No se pudieron cargar las ventas");
          setRows([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [brand, model, customer, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setBrand("");
    setModel("");
    setCustomer("");
    setDateFrom("");
    setDateTo("");
    setError("");
  };

  return (
    <>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Mis ventas
      </Typography>

      {error && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Alert severity='error'>{error}</Alert>
        </Paper>
      )}

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField
              label='Marca'
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              fullWidth
              size='small'
              placeholder='Fiat, VW...'
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label='Modelo'
              value={model}
              onChange={(e) => setModel(e.target.value)}
              fullWidth
              size='small'
              placeholder='Gol, Onix...'
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label='Cliente (email)'
              value={customer}
              onChange={(e) => setCustomer(e.target.value)}
              fullWidth
              size='small'
              placeholder='parte del mail'
            />
          </Grid>

          <Grid item xs={6} md={1.5}>
            <TextField
              label='Desde'
              type='date'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6} md={1.5}>
            <TextField
              label='Hasta'
              type='date'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button variant='outlined' fullWidth onClick={handleClearFilters}>
              Limpiar
            </Button>
          </Grid>
        </Grid>
      </Paper>

      <Paper variant='outlined' sx={{ p: 2 }}>
        {/* Spinner mientras recarga, pero sin volar la tabla/filtros */}
        {loading && (
          <div style={{ marginBottom: 8 }}>
            <CircularProgress size={20} />
          </div>
        )}

        {rows.length === 0 && !loading ? (
          <Typography color='text.secondary'>
            Todavía no tenés ventas registradas.
          </Typography>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>#</TableCell>
                <TableCell>Auto</TableCell>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad</TableCell>
                <TableCell>Total</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell>Fecha</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.brand} {r.model}
                  </TableCell>
                  <TableCell>{r.buyer_email}</TableCell>
                  <TableCell>{r.quantity}</TableCell>
                  <TableCell>
                    {r.unit_price_currency} {r.total_amount}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={
                        r.status === "CANCELLED"
                          ? "Cancelada"
                          : r.status === "COMPLETED"
                          ? "Completada"
                          : "Desconocido"
                      }
                      color={
                        r.status === "CANCELLED"
                          ? "default"
                          : r.status === "COMPLETED"
                          ? "success"
                          : "warning"
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(r.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Paper>
    </>
  );
}
