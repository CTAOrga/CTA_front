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
  CircularProgress,
  Alert,
  Chip,
} from "@mui/material";
import { searchAdminUsers } from "../infra/adminUsersService";

const ROLE_LABELS = {
  admin: "Admin",
  buyer: "Buyer",
  agency: "Agency",
};

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [page, setPage] = useState(0); // 0-based UI
  const [pageSize, setPageSize] = useState(20);

  const [q, setQ] = useState("");
  const [role, setRole] = useState("all"); // all | admin | buyer | agency

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await searchAdminUsers({
        page: page + 1, // backend 1-based
        pageSize,
        q: q || undefined,
        role: role === "all" ? undefined : role,
      });

      setRows(data.items || []);
      setTotal(Number(data.total) || 0);
    } catch (e) {
      console.error(e);
      setError("No se pudieron cargar los usuarios");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // cargar cuando cambian filtros o paginado
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, role]);

  return (
    <Container maxWidth='lg' sx={{ py: 2 }}>
      <Typography variant='h4' gutterBottom>
        Usuarios registrados
      </Typography>

      {/* Filtros */}
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              label='Buscar por email'
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
              placeholder='usuario@ejemplo.com'
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label='Rol'
              value={role}
              onChange={(e) => {
                setRole(e.target.value);
                setPage(0);
              }}
              fullWidth
              size='small'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='admin'>Admin</MenuItem>
              <MenuItem value='buyer'>Buyer</MenuItem>
              <MenuItem value='agency'>Agency</MenuItem>
            </TextField>
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
              <TableCell>ID</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Rol</TableCell>
              <TableCell>Agencia</TableCell>
              <TableCell>Fecha alta</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {!loading &&
              rows.map((u) => {
                const created =
                  u.created_at && new Date(u.created_at).toLocaleString();
                return (
                  <TableRow key={u.id}>
                    <TableCell>{u.id}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      <Chip
                        label={ROLE_LABELS[u.role] || u.role}
                        size='small'
                        color={
                          u.role === "admin"
                            ? "secondary"
                            : u.role === "agency"
                            ? "warning"
                            : "default"
                        }
                      />
                    </TableCell>
                    <TableCell>
                      {u.agency_name
                        ? `${u.agency_name} (#${u.agency_id})`
                        : "—"}
                    </TableCell>
                    <TableCell>{created || "—"}</TableCell>
                  </TableRow>
                );
              })}

            {!loading && rows.length === 0 && !error && (
              <TableRow>
                <TableCell colSpan={5}>
                  <Typography color='text.secondary'>
                    No se encontraron usuarios para el filtro.
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
            setPage(0);
            setPageSize(parseInt(e.target.value, 10));
          }}
        />
      </Paper>
    </Container>
  );
}
