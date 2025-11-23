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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  Rating,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import { getMyReviews, updateReview } from "../infra/reviewsService.js";

export default function MyReviews() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const [editing, setEditing] = useState(null); // { id, rating, comment }
  const [saving, setSaving] = useState(false);

  const navigate = useNavigate();

  const load = async () => {
    try {
      setLoading(true);
      const data = await getMyReviews();
      setRows(data);
    } catch (err) {
      console.error("Error cargando reseñas:", err);
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
  }, []);

  const handleCloseSnackbar = (_, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenEdit = (row) => {
    setEditing({
      id: row.id,
      rating: row.rating,
      comment: row.comment ?? "",
    });
  };

  const handleCloseEdit = () => {
    if (saving) return;
    setEditing(null);
  };

  const handleSaveEdit = async () => {
    if (!editing || !editing.rating) return;
    try {
      setSaving(true);
      const updated = await updateReview(editing.id, {
        rating: editing.rating,
        comment: editing.comment,
      });

      setRows((prev) =>
        prev.map((r) => (r.id === updated.id ? { ...r, ...updated } : r))
      );

      setSnackbar({
        open: true,
        message: "Reseña actualizada",
        severity: "success",
      });
      setEditing(null);
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

  const goToListingDetail = (listingId, carModelLabel) => {
    if (listingId) {
      navigate(`/listings/${listingId}`);
    } else {
      // fallback: volvemos al Home con un pequeño filtro textual
      navigate(`/?q=${encodeURIComponent(carModelLabel)}`);
    }
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
        Mis reseñas
      </Typography>

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
                      onClick={() => goToListingDetail(r.listing_id, label)}
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

      {/* Diálogo de edición */}
      <Dialog
        open={!!editing}
        onClose={handleCloseEdit}
        fullWidth
        maxWidth='sm'
      >
        <DialogTitle>Editar reseña</DialogTitle>
        <DialogContent dividers>
          {editing && (
            <Box sx={{ mt: 1 }}>
              <Typography variant='subtitle2' sx={{ mb: 1 }}>
                Puntaje
              </Typography>
              <Rating
                value={editing.rating}
                onChange={(_, value) =>
                  setEditing((prev) => ({ ...prev, rating: value }))
                }
              />
              <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
                Comentario
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={3}
                value={editing.comment}
                onChange={(e) =>
                  setEditing((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit} disabled={saving}>
            Cancelar
          </Button>
          <Button
            onClick={handleSaveEdit}
            disabled={saving || !editing?.rating}
            variant='contained'
          >
            Guardar
          </Button>
        </DialogActions>
      </Dialog>

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
