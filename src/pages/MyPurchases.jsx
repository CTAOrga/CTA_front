import React, { useEffect, useState } from "react";
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
} from "@mui/material";
import {
  getMyPurchases,
  cancelPurchase,
  reactivatePurchase,
} from "../infra/purchasesService.js";

export default function MyPurchases() {
  const [purchases, setPurchases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    async function load() {
      try {
        const data = await getMyPurchases();
        setPurchases(data);
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

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCancel = async (purchaseId) => {
    try {
      const updated = await cancelPurchase(purchaseId);
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
