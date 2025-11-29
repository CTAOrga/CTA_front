import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Paper,
  Stack,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  getInventoryItemById,
  updateInventoryItem,
} from "../infra/inventoryService";

export default function EditInventoryItemAgency() {
  const { id } = useParams();
  const navigate = useNavigate();
  const inventoryId = parseInt(id, 10);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const [item, setItem] = useState(null);

  const [quantity, setQuantity] = useState("");
  const [isUsed, setIsUsed] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInventoryItemById(inventoryId);
      setItem(data);
      setQuantity(String(data.quantity ?? ""));
      setIsUsed(!!data.is_used);
    } catch (e) {
      console.error(e);
      setError("No se pudo cargar el ítem de inventario");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inventoryId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      await updateInventoryItem(inventoryId, {
        quantity: quantity ? Number(quantity) : 0,
        is_used: isUsed,
      });
      navigate("/agencies/inventory");
    } catch (e) {
      console.error(e);
      setError("No se pudo actualizar el ítem de inventario");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // resetear los campos al valor original
    if (item) {
      setQuantity(String(item.quantity ?? ""));
      setIsUsed(!!item.is_used);
    }
  };

  const handleBack = () => {
    navigate("/agencies/inventory");
  };

  if (loading) {
    return (
      <Box sx={{ mt: 4, textAlign: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!item) {
    return (
      <Box sx={{ mt: 4 }}>
        <Alert severity='error'>No se encontró el ítem de inventario</Alert>
        <Button sx={{ mt: 2 }} variant='outlined' onClick={handleBack}>
          Volver
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h5'>Editar ítem de inventario</Typography>

          <Typography color='text.secondary'>
            {item.brand} {item.model}
          </Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          <TextField
            label='Cantidad'
            value={quantity}
            onChange={(e) => setQuantity(e.target.value.replace(/[^\d]/g, ""))}
            fullWidth
            size='small'
          />

          <FormControlLabel
            control={
              <Checkbox
                checked={isUsed}
                onChange={(e) => setIsUsed(e.target.checked)}
              />
            }
            label='Es usado'
          />

          <Stack direction='row' spacing={2} sx={{ mt: 2 }}>
            <Button variant='contained' onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar cambios"}
            </Button>

            <Button variant='outlined' onClick={handleCancel}>
              Cancelar cambios
            </Button>

            <Button variant='text' onClick={handleBack}>
              Volver al listado
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
