import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  CircularProgress,
  TextField,
  Alert,
} from "@mui/material";

import {
  getMyListingById,
  updateListing,
} from "../infra/agencyListingsService";

export default function EditListingAgency() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("ARS");
  const [stock, setStock] = useState("");
  const [sellerNotes, setSellerNotes] = useState("");
  const [expiresOn, setExpiresOn] = useState("");

  const listingId = parseInt(id, 10);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await getMyListingById(listingId);
      setListing(data);
      syncFormFromListing(data);
    } catch (e) {
      setError("No se pudo cargar la oferta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [listingId]);

  const syncFormFromListing = (l) => {
    const p =
      l.price != null
        ? l.price
        : l.current_price_amount != null
        ? l.current_price_amount
        : null;

    const c = l.currency || l.current_price_currency || "ARS";

    setPrice(p != null ? String(p) : "");
    setCurrency(c);
    setStock(l.stock != null ? String(l.stock) : "");
    setSellerNotes(l.seller_notes || "");
    setExpiresOn(l.expires_on ? l.expires_on.slice(0, 10) : "");
  };

  const handleCancel = () => {
    if (listing) {
      syncFormFromListing(listing);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload = {
        current_price_amount: price ? Number(price) : undefined,
        current_price_currency: currency,
        stock: stock ? Number(stock) : undefined,
        seller_notes: sellerNotes,
        expires_on: expiresOn ? new Date(expiresOn).toISOString() : null,
      };

      await updateListing(listingId, payload);
      navigate(`/agencies/listings/${listingId}`);
    } catch (e) {
      setError("Error guardando cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <CircularProgress />;
  }

  if (!listing) {
    return <Alert severity='error'>No se encontró la oferta</Alert>;
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h5'>Editar Oferta</Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          <TextField
            label='Precio'
            value={price}
            onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
            fullWidth
            size='small'
          />

          <TextField
            label='Moneda'
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            fullWidth
            size='small'
          />

          <TextField
            label='Stock'
            value={stock}
            onChange={(e) => setStock(e.target.value.replace(/[^\d]/g, ""))}
            fullWidth
            size='small'
          />

          <TextField
            label='Notas del vendedor'
            value={sellerNotes}
            onChange={(e) => setSellerNotes(e.target.value)}
            multiline
            minRows={3}
            size='small'
          />

          <TextField
            label='Fecha de vencimiento'
            type='date'
            value={expiresOn}
            onChange={(e) => setExpiresOn(e.target.value)}
            fullWidth
            size='small'
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
            <Button variant='contained' onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>

            <Button variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
            <Button variant='text' onClick={() => navigate("/")}>
              Volver
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
