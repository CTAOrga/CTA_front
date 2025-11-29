import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
} from "@mui/material";
import { createInventoryItem } from "../infra/inventoryService";
import { searchCarModels } from "../infra/carModelsService";
import Autocomplete from "@mui/material/Autocomplete";

export default function CreateInventoryItemAgency() {
  const navigate = useNavigate();

  const [brand, setBrand] = useState("");
  const [model, setModel] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [isUsed, setIsUsed] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [year, setYear] = useState("");
  const [carModelsOptions, setCarModelsOptions] = useState([]);
  const [selectedCarModel, setSelectedCarModel] = useState(null);
  const [loadingCarModels, setLoadingCarModels] = useState(false);
  const [carModelError, setCarModelError] = useState("");

  const handleSave = async () => {
    setError("");
    setCarModelError("");

    if (!selectedCarModel) {
      setCarModelError("Debés seleccionar un modelo del catálogo.");
      return;
    }

    if (!quantity || Number(quantity) <= 0) {
      setError("La cantidad debe ser mayor que 0.");
      return;
    }

    setSaving(true);
    try {
      await createInventoryItem({
        brand: brand,
        model: model,
        quantity: quantity ? Number(quantity) : 0,
        is_used: isUsed,
      });
      navigate("/agencies/inventory");
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail ?? "Error al crear inventario");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/agencies/inventory");
  };

  const handleSearchCarModels = async (_event, value) => {
    setCarModelError("");
    setError("");

    if (!value || value.length < 2) {
      setCarModelsOptions([]);
      return;
    }

    setLoadingCarModels(true);
    try {
      const data = await searchCarModels({ q: value });
      setCarModelsOptions(data);
    } catch (err) {
      console.error(err);
      setError("No se pudieron buscar los modelos de auto.");
    } finally {
      setLoadingCarModels(false);
    }
  };

  const handleChangeCarModel = (_event, newValue) => {
    setSelectedCarModel(newValue);
    if (newValue) {
      setBrand(newValue.brand);
      setModel(newValue.model);
    } else {
      setBrand("");
      setModel("");
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: "auto", mt: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Stack spacing={2}>
          <Typography variant='h5'>Nuevo ítem de inventario</Typography>

          {error && <Alert severity='error'>{error}</Alert>}

          <Autocomplete
            options={carModelsOptions}
            loading={loadingCarModels}
            value={selectedCarModel}
            onChange={handleChangeCarModel}
            onInputChange={handleSearchCarModels}
            getOptionLabel={(opt) =>
              opt.year
                ? `${opt.brand} ${opt.model} (${opt.year})`
                : `${opt.brand} ${opt.model}`
            }
            renderInput={(params) => (
              <TextField
                {...params}
                label='Modelo (catálogo car_models)'
                placeholder='Escribí marca o modelo...'
                error={!!carModelError}
                helperText={
                  carModelError ||
                  "Escribí para buscar en el catálogo global de modelos."
                }
              />
            )}
          />

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
              {saving ? "Guardando..." : "Crear"}
            </Button>

            <Button variant='outlined' onClick={handleCancel}>
              Cancelar
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
