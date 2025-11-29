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
import { getAdminReviews } from "../infra/adminReviewsService";

export default function AdminReviews() {
  // filtros
  const [q, setQ] = useState("");
  const [minRating, setMinRating] = useState("");
  const [maxRating, setMaxRating] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // datos
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  // paginación (0-based en UI)
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    // validación rápida de rating
    if (
      minRating !== "" &&
      maxRating !== "" &&
      Number(minRating) > Number(maxRating)
    ) {
      alert("El rating mínimo no puede ser mayor que el máximo");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const data = await getAdminReviews({
        page: page + 1, // backend 1-based
        pageSize,
        q,
        minRating: minRating === "" ? undefined : Number(minRating),
        maxRating: maxRating === "" ? undefined : Number(maxRating),
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setRows(data.items || []);
      setTotal(Number(data.total) || 0);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar las reseñas");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Auto-búsqueda: cada vez que cambia CUALQUIER filtro o la paginación
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q, minRating, maxRating, dateFrom, dateTo]);

  const handleClearFilters = () => {
    setQ("");
    setMinRating("");
    setMaxRating("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
    setPageSize(20);
  };

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h4' gutterBottom>
        Reseñas de usuarios
      </Typography>

      {/* Filtros */}
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label='Buscar (email, auto, comentario)'
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              placeholder='ej: @gmail.com, Gol, "muy bueno"...'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              select
              label='Rating mín.'
              value={minRating}
              onChange={(e) => {
                setMinRating(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              <MenuItem value=''>—</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              select
              label='Rating máx.'
              value={maxRating}
              onChange={(e) => {
                setMaxRating(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              <MenuItem value=''>—</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={6} md={2}>
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

          <Grid item xs={6} md={2}>
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

          <Grid item xs={12} md='auto'>
            <Grid container spacing={1}>
              <Grid item>
                <TextField
                  select
                  label='Filas por página'
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(parseInt(e.target.value, 10));
                    setPage(0);
                  }}
                  size='small'
                  sx={{ minWidth: 140 }}
                >
                  {[10, 20, 50].map((n) => (
                    <MenuItem key={n} value={n}>
                      {n}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item>
                {/* Solo dejamos "Limpiar filtros" */}
                <button
                  type='button'
                  className='btn btn-default'
                  onClick={handleClearFilters}
                  disabled={loading}
                >
                  Limpiar filtros
                </button>
              </Grid>
            </Grid>
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

      {/* Tabla de reseñas */}
      <Paper variant='outlined'>
        <Table size='small' stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Auto</TableCell>
              <TableCell>Usuario</TableCell>
              <TableCell>Rating</TableCell>
              <TableCell>Comentario</TableCell>
              <TableCell>Fecha</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>{r.id}</TableCell>
                  <TableCell>
                    {r.brand} {r.model}
                  </TableCell>
                  <TableCell>{r.buyer_email}</TableCell>
                  <TableCell>
                    <Chip
                      label={r.rating}
                      color={
                        r.rating >= 4
                          ? "success"
                          : r.rating === 3
                          ? "warning"
                          : "error"
                      }
                      size='small'
                    />
                  </TableCell>
                  <TableCell>{r.comment || "—"}</TableCell>
                  <TableCell>
                    {r.created_at
                      ? new Date(r.created_at).toLocaleString()
                      : "—"}
                  </TableCell>
                </TableRow>
              ))}

            {!loading && rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6}>
                  <Typography color='text.secondary'>
                    No hay reseñas para el filtro seleccionado.
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
          onPageChange={(_, p) => setPage(p)}
          onRowsPerPageChange={(e) => {
            setPageSize(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Paper>
    </Container>
  );
}
