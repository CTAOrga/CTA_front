import { useEffect, useState } from "react";
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
  TextField,
  Box,
  Rating,
  Grid,
  MenuItem,
  Paper,
} from "@mui/material";
import { getMyReviews, updateReview } from "../infra/reviewsService.js";
import ReviewDialog from "../components/ReviewDialog";

export default function MyReviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Filtros
  const [brandFilter, setBrandFilter] = useState("");
  const [modelFilter, setModelFilter] = useState("");
  const [minRatingFilter, setMinRatingFilter] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Diálogo (detalle / edición)
  const [dialogReview, setDialogReview] = useState(null); // { id, brand, model, rating, comment, ... }
  const [dialogMode, setDialogMode] = useState("view"); // "view" | "edit"
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      setLoading(true);

      if (dateFrom && dateTo && dateFrom > dateTo) {
        setRows([]);
        setSnackbar({
          open: true,
          message: '"Desde" no puede ser mayor que "Hasta"',
          severity: "warning",
        });
        return;
      }

      const data = await getMyReviews({
        brand: brandFilter || undefined,
        model: modelFilter || undefined,
        minRating: minRatingFilter ? Number(minRatingFilter) : undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      setRows(data || []);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
      setRows([]);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.detail || "No se pudieron cargar las reseñas",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandFilter, modelFilter, minRatingFilter, dateFrom, dateTo]);

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleClearFilters = () => {
    setBrandFilter("");
    setModelFilter("");
    setMinRatingFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const handleOpenView = (row) => {
    setDialogMode("view");
    setDialogReview({
      ...row,
      comment: row.comment ?? "",
    });
  };
  const handleOpenEdit = (row) => {
    setDialogMode("edit");
    setDialogReview({
      ...row,
      comment: row.comment ?? "",
    });
  };

  const handleCloseDialog = () => {
    if (saving && dialogMode === "edit") return;
    setDialogReview(null);
  };

  const handleSaveEdit = async () => {
    if (!dialogReview || !dialogReview.rating) return;
    try {
      setSaving(true);
      const updated = await updateReview(dialogReview.id, {
        rating: dialogReview.rating,
        comment: dialogReview.comment,
      });

      setRows((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
      );

      setSnackbar({
        open: true,
        message: "Reseña actualizada",
        severity: "success",
      });
      setDialogReview(null);
    } catch (err) {
      console.error("No se pudo actualizar la reseña:", err);
      setSnackbar({
        open: true,
        message:
          err?.response?.data?.detail || "No se pudo actualizar la reseña",
        severity: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading && rows.length === 0) {
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
        Mis reseñas
      </Typography>

      <Paper variant='outlined' sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={1.5}>
          <Grid item xs={12} md={3}>
            <TextField
              label='Marca'
              value={brandFilter}
              onChange={(e) => setBrandFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Fiat, VW...'
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label='Modelo'
              value={modelFilter}
              onChange={(e) => setModelFilter(e.target.value)}
              fullWidth
              size='small'
              placeholder='Gol, Onix...'
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              select
              label='Puntaje mínimo'
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(e.target.value)}
              fullWidth
              size='small'
            >
              <MenuItem value=''>Todos</MenuItem>
              {[1, 2, 3, 4, 5].map((n) => (
                <MenuItem key={n} value={n}>
                  {n} ⭐ o más
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              type='date'
              label='Desde'
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField
              type='date'
              label='Hasta'
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
              size='small'
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md='auto'>
            <Button variant='outlined' onClick={handleClearFilters}>
              Limpiar filtros
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {rows.length === 0 ? (
        <Typography>
          Todavía no escribiste reseñas sobre ningún modelo.
        </Typography>
      ) : (
        <Table size='small'>
          <TableHead>
            <TableRow>
              <TableCell>Modelo</TableCell>
              <TableCell>Puntaje</TableCell>
              <TableCell>Comentario</TableCell>
              <TableCell>Fecha</TableCell>
              <TableCell align='center'>Acciones</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((r) => {
              const label = `${r.brand} ${r.model}`;
              return (
                <TableRow key={r.id}>
                  <TableCell>{label}</TableCell>
                  <TableCell>
                    <Rating value={r.rating} readOnly size='small' />
                  </TableCell>
                  <TableCell>
                    {r.comment && r.comment.length > 80
                      ? r.comment.slice(0, 80) + "…"
                      : r.comment || "(Sin comentario)"}
                  </TableCell>
                  <TableCell>
                    {new Date(r.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell align='center'>
                    <Button
                      size='small'
                      variant='outlined'
                      sx={{ mr: 1, mb: 0.5 }}
                      onClick={() => handleOpenView(r)}
                    >
                      Ver detalle
                    </Button>
                    <Button
                      size='small'
                      variant='contained'
                      onClick={() => handleOpenEdit(r)}
                    >
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      )}

      <ReviewDialog
        open={!!dialogReview}
        mode={dialogMode}
        review={dialogReview}
        saving={saving}
        onClose={handleCloseDialog}
        onSave={handleSaveEdit}
        onChangeRating={(value) =>
          setDialogReview((prev) => (prev ? { ...prev, rating: value } : prev))
        }
        onChangeComment={(value) =>
          setDialogReview((prev) => (prev ? { ...prev, comment: value } : prev))
        }
      />

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
