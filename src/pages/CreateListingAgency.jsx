import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import { createListing } from "../infra/agencyListingsService";
import { getInventory } from "../infra/inventoryService";

export default function CreateListingAgency() {
  const navigate = useNavigate();

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [stock, setStock] = useState("");
  const [sellerNotes, setSellerNotes] = useState("");
  const [expiresOn, setExpiresOn] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [inventory, setInventory] = useState([]);
  const [carModelId, setCarModelId] = useState("");

  useEffect(() => {
    const loadInventory = async () => {
      try {
        const data = await getInventory();
        setInventory(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error("Error cargando inventario", e);
        setInventory([]);
      }
    };
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!carModelId || !price || !stock) {
      setError("Completá al menos marca, modelo, precio y stock.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        car_model_id: Number(carModelId),
        current_price_amount: Number(price),
        current_price_currency: currency,
        stock: Number(stock),
        seller_notes: sellerNotes || null,
        expires_on: expiresOn ? new Date(expiresOn).toISOString() : null,
      };

      const created = await createListing(payload);

      // Después de crear, te llevo al detalle de esa publicación de agencia
      navigate(`/agencies/listings/${created.id}`);
    } catch (err) {
      console.error(err);
      setError("No se pudo crear la publicación.");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setPrice("");
    setCurrency("USD");
    setStock("");
    setSellerNotes("");
    setExpiresOn("");
  };

  const handleBack = () => {
    navigate("/");
  };

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant='h5'>Crear nueva publicación</Typography>

            {error && <Alert severity='error'>{error}</Alert>}

            <select
              value={carModelId}
              onChange={(e) => setCarModelId(e.target.value)}
            >
              <option value=''>Seleccionar auto</option>
              {inventory.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.brand} {c.model} ({c.is_used ? "Usado" : "Nuevo"})
                </option>
              ))}
            </select>

            <TextField
              label='Precio'
              value={price}
              onChange={(e) => setPrice(e.target.value.replace(/[^\d.]/g, ""))}
              fullWidth
              size='small'
              required
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
              required
            />

            <TextField
              label='Notas del vendedor'
              value={sellerNotes}
              onChange={(e) => setSellerNotes(e.target.value)}
              fullWidth
              size='small'
              multiline
              minRows={3}
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
              <Button variant='contained' type='submit' disabled={saving}>
                {saving ? "Creando..." : "Crear publicación"}
              </Button>

              <Button variant='outlined' onClick={handleCancel}>
                Limpiar
              </Button>

              <Button variant='text' onClick={handleBack}>
                Volver
              </Button>
            </Stack>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
