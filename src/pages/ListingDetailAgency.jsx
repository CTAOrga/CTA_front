import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  Alert,
  Divider,
} from "@mui/material";

import {
  getMyListingById,
  cancelListing,
  activateListing,
  deleteListing,
} from "../infra/agencyListingsService";

export default function ListingDetailAgency() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);

  const listingId = id ? parseInt(id, 10) : NaN;

  const loadListing = async () => {
    if (!listingId) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await getMyListingById(listingId);
      setListing(data);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async () => {
    if (!listing) return;

    setActionLoading(true);
    setError(null);

    try {
      if (listing.is_active) {
        await cancelListing(listing.id);
        setListing((prev) => ({ ...prev, is_active: false }));
      } else {
        await activateListing(listing.id);
        setListing((prev) => ({ ...prev, is_active: true }));
      }
    } catch (e) {
      console.error(e);
      setError("No se pudo cambiar el estado de la publicación");
    } finally {
      setActionLoading(false);
    }
  };

  useEffect(() => {
    loadListing();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  const handleDelete = async () => {
    if (!listingId) return;
    const ok = window.confirm(
      "¿Seguro que querés eliminar definitivamente esta oferta?"
    );
    if (!ok) return;

    setActionLoading(true);
    setError(null);
    try {
      await deleteListing(listingId);
      navigate("/agencies/home"); // ajustá si tu home es otra ruta
    } catch (e) {
      console.error(e);
      setError("No se pudo eliminar la oferta");
    } finally {
      setActionLoading(false);
    }
  };

  if (!id || Number.isNaN(listingId)) {
    return <Alert severity='error'>ID de oferta inválido</Alert>;
  }

  if (loading) {
    return (
      <Stack alignItems='center' justifyContent='center' sx={{ mt: 4 }}>
        <CircularProgress />
      </Stack>
    );
  }

  if (!listing) {
    return <Alert severity='error'>No se encontró la oferta</Alert>;
  }

  // Compatibilidad: por si el backend devuelve current_price_* en vez de price/currency
  const price =
    listing.price != null
      ? listing.price
      : listing.current_price_amount != null
      ? listing.current_price_amount
      : null;

  const currency = listing.currency || listing.current_price_currency || "ARS";

  return (
    <Box sx={{ maxWidth: 800, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h5'>
            {listing.brand} {listing.model}
          </Typography>

          <Typography variant='body2' color='text.secondary'>
            ID: {listing.id}{" "}
            {listing.created_at && (
              <>· Creada: {new Date(listing.created_at).toLocaleString()}</>
            )}
          </Typography>

          <Divider />

          <Stack spacing={1}>
            <Typography variant='body1'>
              <strong>Precio:</strong>{" "}
              {price != null
                ? `${currency} ${Number(price).toLocaleString()}`
                : "—"}
            </Typography>

            <Typography variant='body1'>
              <strong>Stock:</strong> {listing.stock ?? "—"}
            </Typography>

            <Typography variant='body1'>
              <strong>Estado:</strong>{" "}
              <span>{listing.is_active ? "Activa" : "Cancelada"}</span>
            </Typography>

            {listing.seller_notes && (
              <Typography variant='body1'>
                <strong>Notas del vendedor:</strong> {listing.seller_notes}
              </Typography>
            )}

            {listing.expires_on && (
              <Typography variant='body1'>
                <strong>Vence:</strong>{" "}
                {new Date(listing.expires_on).toLocaleDateString()}
              </Typography>
            )}
          </Stack>

          {error && <Alert severity='error'>{error}</Alert>}

          {/* Acciones */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            sx={{ mt: 2 }}
          >
            <Button
              variant='outlined'
              color={listing.is_active ? "warning" : "success"}
              onClick={handleToggleActive}
              disabled={actionLoading}
            >
              {listing.is_active
                ? "Desactivar publicación"
                : "Activar publicación"}
            </Button>
            <Button
              variant='outlined'
              color='error'
              onClick={handleDelete}
              disabled={actionLoading}
            >
              Eliminar definitivamente
            </Button>

            <Button
              variant='text'
              onClick={() => navigate(-1)}
              disabled={actionLoading}
            >
              Volver
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
