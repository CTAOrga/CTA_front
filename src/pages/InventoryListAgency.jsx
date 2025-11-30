import { useEffect, useState } from "react";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TablePagination,
  CircularProgress,
  Chip,
} from "@mui/material";
import { getMyInventory, deleteInventoryItem } from "../infra/inventoryService";

export default function InventoryListAgency() {
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [usedFilter, setUsedFilter] = useState("all"); // all | used | new

  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      let is_used = undefined;
      if (usedFilter === "used") is_used = true;
      if (usedFilter === "new") is_used = false;

      const data = await getMyInventory({
        page: page + 1,
        pageSize,
        brand: brand || undefined,
        model: model || undefined,
        is_used,
      });

      setRows(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total) || 0);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el inventario");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, brand, model, usedFilter]);

  const handleClear = () => {
    setBrand("");
    setModel("");
    setUsedFilter("all");
    setPage(0);
    setPageSize(20);
  };

  const handleEdit = (id) => {
    navigate(`/agencies/inventory/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const ok = window.confirm(
      "¿Seguro que querés eliminar este item de inventario?"
    );
    if (!ok) return;

    setDeletingId(id);
    setError(null);

    try {
      await deleteInventoryItem(id);
      await load();
    } catch (e) {
      setError("No se pudo eliminar el item de inventario");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 2 }}>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Inventario de la agencia
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction='row' spacing={2} flexWrap='wrap'>
          <TextField
            label='Marca'
            value={brand}
            onChange={(e) => {
              setBrand(e.target.value);
              setPage(0);
            }}
            size='small'
          />
          <TextField
            label='Modelo'
            value={model}
            onChange={(e) => {
              setModel(e.target.value);
              setPage(0);
            }}
            size='small'
          />
          <TextField
            select
            label='Estado'
            value={usedFilter}
            onChange={(e) => {
              setUsedFilter(e.target.value);
              setPage(0);
            }}
            size='small'
            sx={{ minWidth: 150 }}
          >
            <MenuItem value='all'>Todos</MenuItem>
            <MenuItem value='used'>Usados</MenuItem>
            <MenuItem value='new'>0 km</MenuItem>
          </TextField>

          <Button variant='outlined' onClick={handleClear}>
            Limpiar
          </Button>

          <Box sx={{ flex: 1 }} />

          <Button
            variant='outlined'
            component={RouterLink}
            to='/agencies/inventory/new'
          >
            Nuevo ítem de inventario
          </Button>
        </Stack>
      </Paper>

      <Paper>
        {error && (
          <Box sx={{ p: 2 }}>
            <Typography color='error'>{error}</Typography>
          </Box>
        )}

        <TableContainer sx={{ maxHeight: 500 }}>
          <Table size='small' stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Marca</TableCell>
                <TableCell>Modelo</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align='right'>Cantidad</TableCell>
                <TableCell align='center'>Acciones</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} align='center'>
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              )}

              {!loading &&
                rows.map((row) => (
                  <TableRow key={row.id} hover>
                    <TableCell>{row.brand}</TableCell>
                    <TableCell>{row.model}</TableCell>
                    <TableCell>
                      <Chip
                        label={row.is_used ? "Usado" : "0 km"}
                        size='small'
                        color={row.is_used ? "default" : "success"}
                      />
                    </TableCell>
                    <TableCell align='right'>{row.quantity}</TableCell>
                    <TableCell align='center'>
                      <Button
                        size='small'
                        variant='outlined'
                        onClick={() => handleEdit(row.id)}
                      >
                        Editar
                      </Button>
                      <Button
                        variant='outlined'
                        size='small'
                        color='error'
                        onClick={() => handleDelete(row.id)}
                        disabled={deletingId === row.id}
                        sx={{ ml: 1 }}
                      >
                        {deletingId === row.id ? "Eliminando..." : "Eliminar"}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}

              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography color='text.secondary'>
                      No hay ítems de inventario.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          component='div'
          count={total}
          rowsPerPage={pageSize}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          onRowsPerPageChange={(e) => {
            setPage(0);
            setPageSize(parseInt(e.target.value, 10));
          }}
          rowsPerPageOptions={[10, 20, 50]}
        />
      </Paper>
    </Box>
  );
}
