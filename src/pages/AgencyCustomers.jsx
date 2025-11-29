import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Alert,
  TextField,
  Grid,
} from "@mui/material";
import { getMyCustomers } from "../infra/agencySalesService";

export default function AgencyCustomers() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [q, setQ] = useState(""); // nombre/email
  const [minPurchases, setMinPurchases] = useState("");
  const [minSpent, setMinSpent] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getMyCustomers({
          q: q || undefined,
          minPurchases: minPurchases ? Number(minPurchases) : undefined,
          minSpent: minSpent ? Number(minSpent) : undefined,
        });

        if (cancelled) return;
        setRows(data || []);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("No se pudieron cargar los clientes");
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
  }, [q, minPurchases, minSpent]);

  const handleClearFilters = () => {
    setQ("");
    setMinPurchases("");
    setMinSpent("");
  };

  return (
    <>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Mis clientes
      </Typography>

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={4}>
            <TextField
              label='Buscar (nombre o email)'
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
              size='small'
              placeholder='juan@correo.com...'
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <TextField
              label='Mínimo de compras'
              value={minPurchases}
              onChange={(e) =>
                setMinPurchases(e.target.value.replace(/[^\d]/g, ""))
              }
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>

          <Grid item xs={6} md={4}>
            <TextField
              label='Monto mínimo gastado'
              value={minSpent}
              onChange={(e) =>
                setMinSpent(e.target.value.replace(/[^\d]/g, ""))
              }
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <button
              onClick={handleClearFilters}
              className='btn btn-default'
              style={{ width: "100%", marginTop: 4 }}
            >
              Limpiar
            </button>
          </Grid>
        </Grid>
      </Paper>

      {loading && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <CircularProgress size={24} />
        </Paper>
      )}

      {error && (
        <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
          <Alert severity='error'>{error}</Alert>
        </Paper>
      )}

      <Paper variant='outlined' sx={{ p: 2 }}>
        {rows.length === 0 && !loading ? (
          <Typography color='text.secondary'>
            Todavía no tenés clientes (no hay compras asociadas para el filtro
            actual).
          </Typography>
        ) : (
          <Table size='small'>
            <TableHead>
              <TableRow>
                <TableCell>Cliente</TableCell>
                <TableCell>Cantidad de compras</TableCell>
                <TableCell>Total gastado</TableCell>
                <TableCell>Última compra</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((r) => (
                <TableRow key={r.customer_id}>
                  <TableCell>{r.email}</TableCell>
                  <TableCell>{r.total_purchases}</TableCell>
                  <TableCell>{r.total_spent}</TableCell>
                  <TableCell>
                    {r.last_purchase_at
                      ? new Date(r.last_purchase_at).toLocaleString()
                      : "—"}
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
