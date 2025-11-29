import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Paper,
  Grid,
  TextField,
  MenuItem,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  Chip,
  CircularProgress,
  Alert,
} from "@mui/material";

import { getAdminPurchases } from "../infra/adminPurchasesService";

const STATUS_OPTIONS = [
  { value: "ALL", label: "Todos" },
  { value: "COMPLETED", label: "Completadas" },
  { value: "CANCELLED", label: "Canceladas" },
  // si tenés PENDING u otros, los agregás acá
];

export default function AdminPurchases() {
  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // datos + estado
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // 0-based para MUI
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // carga cada vez que cambian filtros o paginación
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      try {
        const data = await getAdminPurchases({
          page: page + 1, // backend 1-based
          pageSize,
          q: q || undefined,
          status,
          dateFrom: dateFrom || undefined,
          dateTo: dateTo || undefined,
        });

        if (cancelled) return;

        setRows(data.items || []);
        setTotal(Number(data.total) || 0);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          setError("No se pudieron cargar las compras");
          setRows([]);
          setTotal(0);
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
  }, [q, status, dateFrom, dateTo, page, pageSize]);

  const handleChangePage = (_, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (e) => {
    setPageSize(parseInt(e.target.value, 10));
    setPage(0);
  };

  const formatMoney = (amount, currency) => {
    if (amount == null) return "—";
    const cur = currency ? `${currency} ` : "";
    return cur + Number(amount).toLocaleString();
  };

  const statusChip = (s) => {
    if (s === "COMPLETED") {
      return <Chip label='Completada' color='success' size='small' />;
    }
    if (s === "CANCELLED") {
      return <Chip label='Cancelada' color='default' size='small' />;
    }
    return <Chip label={s || "Desconocido"} color='warning' size='small' />;
  };

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h4' gutterBottom>
        Compras realizadas
      </Typography>

      {/* Filtros */}
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <TextField
              label='Buscar (email, auto, agencia)'
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              placeholder='Ej: nico@..., Fiat, Agencia X...'
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              select
              label='Estado'
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              {STATUS_OPTIONS.map((opt) => (
                <MenuItem key={opt.value} value={opt.value}>
                  {opt.label}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={2.5}>
            <TextField
              type='date'
              label='Desde'
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} sm={2.5}>
            <TextField
              type='date'
              label='Hasta'
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
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

      <Paper variant='outlined'>
        <Table size='small' stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>#</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell>Cliente</TableCell>
              <TableCell>Agencia</TableCell>
              <TableCell>Auto</TableCell>
              <TableCell align='right'>Cant.</TableCell>
              <TableCell align='right'>Precio unit.</TableCell>
              <TableCell align='right'>Total</TableCell>
              <TableCell>Estado</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                  <TableCell>
                    {r.buyer_email} (#{r.buyer_id})
                  </TableCell>
                  <TableCell>
                    {r.agency_name} (#{r.agency_id})
                  </TableCell>
                  <TableCell>
                    {r.brand} {r.model} (#{r.listing_id})
                  </TableCell>
                  <TableCell align='right'>{r.quantity}</TableCell>
                  <TableCell align='right'>
                    {formatMoney(r.unit_price_amount, r.unit_price_currency)}
                  </TableCell>
                  <TableCell align='right'>
                    {formatMoney(r.total_amount, r.unit_price_currency)}
                  </TableCell>
                  <TableCell>{statusChip(r.status)}</TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={9}>
                  <Typography color='text.secondary'>
                    No hay compras para el filtro seleccionado.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        <TablePagination
          component='div'
          rowsPerPageOptions={[10, 20, 50]}
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Container>
  );
}
