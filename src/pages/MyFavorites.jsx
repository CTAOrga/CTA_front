import React, { useEffect, useState } from "react";
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
  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyFavorites();
      setRows(data);
    } catch (err) {
      console.error("Error cargando favoritos:", err);
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
  }, []);

  // Si cambian favoritos desde otra pantalla, recargo
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

  if (loading) {
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

      {rows.length === 0 ? (
        <Typography>
          Todavía no tenés autos guardados como favoritos.
        </Typography>
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
