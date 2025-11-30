import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Grid,
  TextField,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getMyFavorites, removeFavorite } from "../infra/favoritesService.js";

function formatPrice(amount, currency) {
  if (amount == null) return "—";
  return `${currency ?? ""} ${amount.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function MyFavorites() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [filterError, setFilterError] = useState("");

  const navigate = useNavigate();

  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [agencyFilter, setAgencyFilter] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const load = async () => {
    const minP = minPrice ? Number(minPrice) : null;
    const maxP = maxPrice ? Number(maxPrice) : null;

    if (minP !== null && maxP !== null && minP > maxP) {
      setFilterError("El precio mínimo no puede ser mayor que el máximo");
      setRows([]);
      return;
    }

    setFilterError("");
    setLoading(true);

    try {
      const data = await getMyFavorites({
        brand: brandFilter || undefined,
        model: modelFilter || undefined,
        agencyId: agencyFilter.trim() || undefined,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      });
      setRows(data || []);
    } catch (err) {
      console.error("Error cargando favoritos:", err);
      setRows([]);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.detail || "No se pudieron cargar los favoritos",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandFilter, modelFilter, agencyFilter, minPrice, maxPrice]);

  useEffect(() => {
    const handler = () => load();
    if (typeof window !== "undefined") {
      window.addEventListener("favorites:changed", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("favorites:changed", handler);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRemove = async (listingId) => {
    try {
      await removeFavorite(listingId);
      // Eliminación definitiva: lo sacamos de la tabla
      setRows((prev) => prev.filter((f) => f.listing_id !== listingId));
      setSnackbar({
        open: true,
        message: "Favorito eliminado",
        severity: "success",
      });
    } catch (err) {
      console.error("No se pudo quitar favorito:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "No se pudo quitar el favorito",
        severity: "error",
      });
    }
  };

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const goToDetail = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  const handleClearFilters = () => {
    setBrandFilter("");
    setModelFilter("");
    setAgencyFilter("");
    setMinPrice("");
    setMaxPrice("");
  };

  if (loading && rows.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "40vh",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Typography variant='h4' gutterBottom>
        Mis favoritos
      </Typography>

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField
              label='Marca'
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Fiat, VW...'
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label='Modelo'
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Gol, Onix...'
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              label='Agencia (ID)'
              value={agencyFilter}
              onChange={(e) => setAgencyFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Ej: 12'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label='Precio mín'
              value={minPrice}
              onChange={(e) =>
                setMinPrice(e.target.value.replace(/[^\d]/g, ""))
              }
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label='Precio máx'
              value={maxPrice}
              onChange={(e) =>
                setMaxPrice(e.target.value.replace(/[^\d]/g, ""))
              }
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>

          <Grid item xs={12} md='auto'>
            <Button variant='outlined' onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </Grid>

          {filterError && (
            <Grid item xs={12}>
              <Alert severity='warning'>{filterError}</Alert>
            </Grid>
          )}
        </Grid>
      </Paper>

      {rows.length === 0 ? (
        <Typography>No hay favoritos para el filtro seleccionado.</Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Modelo</TableCell>
              <TableCell>Agencia</TableCell>
              <TableCell>Precio actual</TableCell>
              <TableCell>Guardado el</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((f) => (
              <TableRow key={f.favorite_id}>
                <TableCell>
                  {f.brand} {f.model}
                </TableCell>
                <TableCell>{f.agency_id ?? "—"}</TableCell>
                <TableCell>{formatPrice(f.price, f.currency)}</TableCell>
                <TableCell>{f.created_at}</TableCell>
                <TableCell align='center'>
                  <Button
                    size='small'
                    variant='outlined'
                    onClick={() => goToDetail(f.listing_id)}
                    sx={{ mr: 1 }}
                  >
                    Ver detalle
                  </Button>
                  <Button
                    size='small'
                    variant='contained'
                    color='error'
                    onClick={() => handleRemove(f.listing_id)}
                    data-testid={`btn-remove-fav-${f.listing_id}`}
                  >
                    Quitar
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          severity={snackbar.severity}
          variant='filled'
          onClose={handleCloseSnackbar}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
