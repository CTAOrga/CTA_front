import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Rating,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Snackbar,
  Alert,
} from "@mui/material";
import { getReviewsByListing, createReview } from "../infra/reviewsService.js";

/**
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - listing: objeto ListingOut (brand, model, id, avg_rating, reviews_count, etc.)
 */
export default function CarModelReviewModal({ open, onClose, listing }) {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);

  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  // Cargar reviews cuando se abre el modal y tenemos listing
  useEffect(() => {
    if (!open || !listing?.id) return;

    async function load() {
      setLoading(true);
      try {
        const data = await getReviewsByListing(listing.id);
        setReviews(data);
      } catch (err) {
        console.error("Error cargando reviews:", err);
        setSnackbar({
          open: true,
          message:
            err?.response?.data?.detail ||
            "No se pudieron cargar las reseñas del modelo",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [open, listing?.id]);

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleSubmitReview = async () => {
    if (!listing?.id) return;

    try {
      const created = await createReview({
        listingId: listing.id,
        rating: newRating,
        comment: newComment,
      });

      // Insertamos la nueva review al principio
      setReviews((prev) => [created, ...prev]);
      setNewRating(5);
      setNewComment("");

      setSnackbar({
        open: true,
        message: "Reseña registrada sobre este modelo",
        severity: "success",
      });
    } catch (err) {
      console.error("Error al crear review:", err);
      setSnackbar({
        open: true,
        message: err?.response?.data?.detail || "No se pudo guardar la reseña",
        severity: "error",
      });
    }
  };

  // Promedio local en base a las reviews cargadas
  const { avgRatingLocal, countLocal } = useMemo(() => {
    if (!reviews || reviews.length === 0) {
      return { avgRatingLocal: null, countLocal: 0 };
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    const count = reviews.length;
    return {
      avgRatingLocal: sum / count,
      countLocal: count,
    };
  }, [reviews]);

  return (
    <>
      <Dialog open={open} onClose={onClose} fullWidth maxWidth='sm'>
        <DialogTitle>
          Modelo: {listing?.brand} {listing?.model}
        </DialogTitle>

        <DialogContent dividers>
          <Typography variant='body2' color='text.secondary' sx={{ mb: 1 }}>
            Las reseñas se aplican al modelo de auto (CarModel), no a una oferta
            específica. Todas las agencias que venden este modelo comparten
            estas reseñas.
          </Typography>

          {/* Resumen de rating */}
          <Box sx={{ mb: 2, mt: 1 }}>
            {countLocal > 0 ? (
              <>
                <Box sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                  <Rating
                    value={avgRatingLocal}
                    precision={0.5}
                    readOnly
                    size='small'
                    sx={{ mr: 1 }}
                  />
                  <Typography variant='body2'>
                    {avgRatingLocal.toFixed(1)} / 5 ({countLocal} reseña
                    {countLocal !== 1 ? "s" : ""})
                  </Typography>
                </Box>
              </>
            ) : (
              <Typography variant='body2'>
                Este modelo todavía no tiene reseñas.
              </Typography>
            )}
          </Box>

          {/* Formulario para nueva review */}
          <Box
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1,
              p: 2,
              mb: 2,
            }}
          >
            <Typography variant='subtitle2' sx={{ mb: 1 }}>
              Dejá tu reseña sobre este modelo
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
              <Typography variant='body2' sx={{ mr: 1 }}>
                Calificación:
              </Typography>
              <Rating
                name='new-rating'
                value={newRating}
                onChange={(_, value) => setNewRating(value || 1)}
              />
            </Box>

            <TextField
              label='Comentario (opcional)'
              fullWidth
              multiline
              minRows={2}
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              sx={{ mb: 1 }}
            />

            <Button
              variant='contained'
              size='small'
              onClick={handleSubmitReview}
              disabled={!newRating}
            >
              Enviar reseña
            </Button>
          </Box>

          {/* Lista de reseñas */}
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          ) : reviews.length === 0 ? (
            <Typography variant='body2' color='text.secondary'>
              No hay reseñas para este modelo aún.
            </Typography>
          ) : (
            <List dense>
              {reviews.map((r) => (
                <ListItem key={r.id} alignItems='flex-start'>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                        }}
                      >
                        <Rating value={r.rating} readOnly size='small' />
                        <Typography
                          component='span'
                          variant='body2'
                          color='text.secondary'
                        >
                          {new Date(r.created_at).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                    secondary={r.comment || "(Sin comentario)"}
                  />
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cerrar</Button>
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
