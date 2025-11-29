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
  CircularProgress,
} from "@mui/material";
import { createListing } from "../infra/agencyListingsService";
import { getMyInventory } from "../infra/inventoryService";
import Autocomplete from "@mui/material/Autocomplete";

export default function CreateListingAgency() {
  const navigate = useNavigate();

  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [stock, setStock] = useState("");
  const [sellerNotes, setSellerNotes] = useState("");
  const [expiresOn, setExpiresOn] = useState("");

  const [loadingInv, setLoadingInv] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [inventory, setInventory] = useState([]);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryError, setInventoryError] = useState("");

  useEffect(() => {
    const loadInventory = async () => {
      try {
        setLoadingInv(true);
        const data = await getMyInventory();
        setInventory(Array.isArray(data.items) ? data.items : []);
      } catch (e) {
        console.error("Error cargando inventario", e);
        setInventory([]);
      } finally {
        setLoadingInv(false);
      }
    };
    loadInventory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!selectedInventory) {
      setInventoryError(
        "Debés seleccionar un auto de tu inventario (escribí y elegí de la lista)."
      );
      return;
    }

    if (!price || !stock) {
      setError("Completá al menos precio y stock.");
      return;
    }

    const requestedStock = Number(stock);

    if (requestedStock > selectedInventory.quantity) {
      setError(
        `No hay stock suficiente en inventario. Disponible: ${selectedInventory.quantity}.`
      );
      return;
    }

    setSaving(true);
    try {
      const payload = {
        inventory_id: selectedInventory.id,
        brand: selectedInventory.brand,
        model: selectedInventory.model,
        current_price_amount: Number(price),
        current_price_currency: currency,
        stock: requestedStock,
        seller_notes: sellerNotes || null,
        expires_on: expiresOn ? new Date(expiresOn).toISOString() : null,
      };

      const created = await createListing(payload);

      // Después de crear, te llevo al detalle de esa publicación de agencia
      navigate(`/agencies/listings/${created.id}`);
    } catch (err) {
      console.error(err);
      const detail = err?.response?.data?.detail;
      if (detail) {
        setError(detail);
      } else {
        setError("Error creando la publicación");
      }
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

  if (loadingInv) {
    return (
      <Box sx={{ mt: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 700, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <form onSubmit={handleSubmit}>
          <Stack spacing={2}>
            <Typography variant='h5'>Crear nueva publicación</Typography>

            {error && <Alert severity='error'>{error}</Alert>}

            {/* AUTOCOMPLETE SOBRE INVENTARIO */}
            <Autocomplete
              options={inventory}
              value={selectedInventory}
              onChange={(_, newValue) => {
                setSelectedInventory(newValue);
                setInventoryError("");
              }}
              getOptionLabel={(option) =>
                `${option.brand} ${option.model}${
                  option.is_used ? " (Usado)" : " (0km)"
                } - stock: ${option.quantity}`
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label='Vehículo (inventario)'
                  placeholder='Ej: Fiat Cronos'
                  size='small'
                  error={!!inventoryError}
                  helperText={
                    inventoryError ||
                    "Escribí marca/modelo y elegí uno de la lista de tu inventario"
                  }
                />
              )}
              noOptionsText='No hay autos en tu inventario que coincidan'
            />

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
