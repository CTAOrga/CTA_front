import React, { useEffect, useState } from "react";
import {
  Typography,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TablePagination,
  TextField,
  CircularProgress,
  Alert,
  Container,
} from "@mui/material";
import { getAdminFavorites } from "../infra/adminFavoritesService";

export default function AdminFavorites() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // 0-based UI
  const [pageSize, setPageSize] = useState(20);
  const [q, setQ] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminFavorites({
        page: page + 1, // backend 1-based
        pageSize,
        q,
      });
      setRows(data.items || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los autos de interés");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, q]);

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Autos de interés guardados
      </Typography>

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <TextField
          label='Buscar por cliente o auto'
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(0);
          }}
          fullWidth
          size='small'
          placeholder='email, Fiat, Gol, etc.'
        />
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
        {rows.length === 0 && !loading ? (
          <Typography color='text.secondary' sx={{ p: 2 }}>
            No hay autos de interés para el filtro seleccionado.
          </Typography>
        ) : (
          <>
            <Table size='small'>
              <TableHead>
                <TableRow>
                  <TableCell>ID favorito</TableCell>
                  <TableCell>Cliente</TableCell>
                  <TableCell>Auto</TableCell>
                  <TableCell>Listing ID</TableCell>
                  <TableCell>Fecha marcado</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell>{r.id}</TableCell>
                    <TableCell>{r.customer_email}</TableCell>
                    <TableCell>
                      {r.brand} {r.model}
                    </TableCell>
                    <TableCell>{r.listing_id}</TableCell>
                    <TableCell>
                      {r.created_at && new Date(r.created_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
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
                setPage(0);
                setPageSize(parseInt(e.target.value, 10));
              }}
            />
          </>
        )}
      </Paper>
    </Container>
  );
}
