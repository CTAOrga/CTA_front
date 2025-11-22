import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getListingById } from "../infra/listingsService.js";
import {
  Card,
  CardContent,
  Typography,
  Button,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { createPurchase } from "../infra/purchasesService.js";

export default function ListingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getListingById(Number(id));
        setListing(data);
      } catch (error) {
        console.error("Error cargando listing:", error);
        setSnackbar({
          open: true,
          message:
            error?.response?.data?.detail || "No se pudo cargar la oferta",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      fetchData();
    }
  }, [id]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleBuy = async () => {
    if (!listing) return;

    try {
      const data = await createPurchase({
        listingId: listing.id,
        quantity: 1,
      });

      setSnackbar({
        open: true,
        message: "Compra realizada con éxito",
        severity: "success",
      });

      // Actualizar stock en la UI sin recargar
      setListing((prev) =>
        prev
          ? {
              ...prev,
              stock: prev.stock - data.quantity,
            }
          : prev
      );
    } catch (error) {
      console.error("Error al comprar:", error);
      const msg =
        error?.response?.data?.detail || "No se pudo realizar la compra";
      setSnackbar({
        open: true,
        message: msg,
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

  if (!listing) {
    return (
      <Typography variant='h6' align='center' sx={{ mt: 4 }}>
        No se encontró la oferta
      </Typography>
    );
  }

  return (
    <>
      <Card sx={{ maxWidth: 600, margin: "2rem auto" }}>
        <CardContent>
          <Typography variant='h5' gutterBottom>
            {listing.brand} {listing.model}
          </Typography>

          <Typography variant='body1'>
            Precio: {listing.current_price_currency}{" "}
            {listing.current_price_amount}
          </Typography>

          <Typography variant='body1'>
            Stock disponible: {listing.stock}
          </Typography>

          {listing.seller_notes && (
            <Typography variant='body2' sx={{ mt: 2 }}>
              Notas del vendedor: {listing.seller_notes}
            </Typography>
          )}

          {listing.is_favorite && (
            <Typography variant='body2' color='primary' sx={{ mt: 1 }}>
              ★ Marcado como favorito
            </Typography>
          )}

          <Button
            variant='contained'
            color='primary'
            sx={{ mt: 3 }}
            onClick={handleBuy}
            disabled={listing.stock <= 0}
          >
            Comprar
          </Button>

          {/* Bloque reservado para Reviews (más adelante) */}
          <div style={{ marginTop: "2rem" }}>
            <Typography variant='h6'>Reseñas</Typography>
            <Typography variant='body2' color='text.secondary'>
              Próximamente: puntuar y dejar un comentario sobre este auto.
            </Typography>
          </div>

          <Button sx={{ mt: 2 }} onClick={() => navigate(-1)}>
            Volver
          </Button>
        </CardContent>
      </Card>

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
