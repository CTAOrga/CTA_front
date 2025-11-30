import { useEffect, useState } from "react";
import {
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Button,
  Chip,
  CircularProgress,
  Snackbar,
  Alert,
  Paper,
  Grid,
  TextField,
  MenuItem,
} from "@mui/material";
import {
  getMyPurchases,
  cancelPurchase,
  reactivatePurchase,
} from "../infra/purchasesService.js";

export default function MyPurchases() {
  const [allPurchases, setAllPurchases] = useState([]); // lista completa
  const [purchases, setPurchases] = useState([]); // lista filtrada
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [statusFilter, setStatusFilter] = useState("all"); // all | active | cancelled
  const [listingFilter, setListingFilter] = useState(""); // por ID de listing (texto)
  const [minQty, setMinQty] = useState("");
  const [maxQty, setMaxQty] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyPurchases();
        setAllPurchases(data || []);
        setPurchases(data || []);
      } catch (err) {
        console.error("Error cargando compras:", err);
        setSnackbar({
          open: true,
          message:
            err?.response?.data?.detail || "No se pudieron cargar las compras",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    let filtered = [...allPurchases];

    // Estado
    if (statusFilter !== "all") {
      filtered = filtered.filter((p) => p.status === statusFilter);
    }

    // Listing ID (coincidencia parcial)
    if (listingFilter.trim() !== "") {
      const needle = listingFilter.trim().toLowerCase();
      filtered = filtered.filter((p) =>
        String(p.listing_id ?? "")
          .toLowerCase()
          .includes(needle)
      );
    }

    const minQ = minQty.trim() !== "" ? Number(minQty) : null;
    const maxQ = maxQty.trim() !== "" ? Number(maxQty) : null;

    if (minQ !== null && !Number.isNaN(minQ)) {
      filtered = filtered.filter((p) => Number(p.quantity) >= minQ);
    }
    if (maxQ !== null && !Number.isNaN(maxQ)) {
      filtered = filtered.filter((p) => Number(p.quantity) <= maxQ);
    }

    const minP = minPrice.trim() !== "" ? Number(minPrice) : null;
    const maxP = maxPrice.trim() !== "" ? Number(maxPrice) : null;

    if (minP !== null && !Number.isNaN(minP)) {
      filtered = filtered.filter((p) => Number(p.unit_price_amount) >= minP);
    }
    if (maxP !== null && !Number.isNaN(maxP)) {
      filtered = filtered.filter((p) => Number(p.unit_price_amount) <= maxP);
    }

    setPurchases(filtered);
  }, [
    statusFilter,
    listingFilter,
    minQty,
    maxQty,
    minPrice,
    maxPrice,
    allPurchases,
  ]);

  const handleClearFilters = () => {
    setStatusFilter("all");
    setListingFilter("");
    setMinQty("");
    setMaxQty("");
    setMinPrice("");
    setMaxPrice("");
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = async (purchaseId) => {
    try {
      const updated = await cancelPurchase(purchaseId);

      setAllPurchases((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setPurchases((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      setSnackbar({
        open: true,
        message: "Compra cancelada",
        severity: "success",
      });
    } catch (err) {
      console.error("Error al cancelar:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "No se pudo cancelar la compra",
        severity: "error",
      });
    }
  };

  const handleReactivate = async (purchaseId) => {
    try {
      const updated = await reactivatePurchase(purchaseId);

      setAllPurchases((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setPurchases((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );

      setSnackbar({
        open: true,
        message: "Compra reactivada",
        severity: "success",
      });
    } catch (err) {
      console.error("Error al reactivar:", err);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.detail || "No se pudo reactivar la compra",
        severity: "error",
      });
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "2rem",
        }}
      >
        <CircularProgress />
      </div>
    );
  }

  return (
    <>
      <Typography variant='h5' sx={{ mb: 2 }}>
        Mis compras
      </Typography>

      {/* 🔹 Barra de filtros (front-only) */}
      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField
              select
              label='Estado'
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              fullWidth
              size='small'
            >
              <MenuItem value='all'>Todos</MenuItem>
              <MenuItem value='active'>Activas</MenuItem>
              <MenuItem value='cancelled'>Canceladas</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              label='Listing (ID)'
              value={listingFilter}
              onChange={(e) => setListingFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Ej: 12'
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <TextField
              label='Cant. mín'
              value={minQty}
              onChange={(e) => setMinQty(e.target.value.replace(/[^\d]/g, ""))}
              fullWidth
              size='small'
              inputMode='numeric'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              label='Cant. máx'
              value={maxQty}
              onChange={(e) => setMaxQty(e.target.value.replace(/[^\d]/g, ""))}
              fullWidth
              size='small'
              inputMode='numeric'
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
        </Grid>
      </Paper>

      {purchases.length === 0 ? (
        <Typography variant='body1'>Todavía no tenés compras.</Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Listing</TableCell>
              <TableCell>Cantidad</TableCell>
              <TableCell>Precio unitario</TableCell>
              <TableCell>Estado</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {purchases.map((p) => (
              <TableRow key={p.id}>
                <TableCell>{p.id}</TableCell>
                <TableCell>{p.listing_id}</TableCell>
                <TableCell>{p.quantity}</TableCell>
                <TableCell>
                  {p.unit_price_currency} {p.unit_price_amount}
                </TableCell>
                <TableCell>
                  <Chip
                    label={p.status === "cancelled" ? "Cancelada" : "Activa"}
                    color={p.status === "cancelled" ? "default" : "success"}
                    size='small'
                  />
                </TableCell>
                <TableCell align='center'>
                  {p.status === "active" ? (
                    <Button
                      size='small'
                      color='warning'
                      variant='outlined'
                      onClick={() => handleCancel(p.id)}
                    >
                      Cancelar
                    </Button>
                  ) : (
                    <Button
                      size='small'
                      color='primary'
                      variant='contained'
                      onClick={() => handleReactivate(p.id)}
                    >
                      Reactivar
                    </Button>
                  )}
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
