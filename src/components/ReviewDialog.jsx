import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Rating,
  TextField,
} from "@mui/material";

export default function ReviewDialog({
  open,
  mode = "view", // "view" | "edit"
  review,
  saving = false,
  onClose,
  onSave,
  onChangeRating,
  onChangeComment,
}) {
  if (!review) return null;

  const isEdit = mode === "edit";
  const title = isEdit ? "Editar reseña" : "Reseña";
  const carLabel = `${review.brand ?? ""} ${review.model ?? ""}`.trim();

  return (
    <Dialog
      open={open}
      onClose={isEdit && saving ? undefined : onClose}
      fullWidth
      maxWidth='sm'
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <Box sx={{ mt: 1 }}>
          {carLabel && (
            <Typography variant='subtitle1' sx={{ mb: 1, fontWeight: 600 }}>
              {carLabel}
            </Typography>
          )}

          <Typography variant='subtitle2' sx={{ mb: 1 }}>
            Puntaje
          </Typography>

          {isEdit ? (
            <Rating
              value={review.rating}
              onChange={(_, value) => onChangeRating && onChangeRating(value)}
            />
          ) : (
            <Rating value={review.rating} readOnly />
          )}

          <Typography variant='subtitle2' sx={{ mt: 2, mb: 1 }}>
            Comentario
          </Typography>

          {isEdit ? (
            <TextField
              fullWidth
              multiline
              minRows={3}
              value={review.comment ?? ""}
              onChange={(e) =>
                onChangeComment && onChangeComment(e.target.value)
              }
            />
          ) : (
            <Typography sx={{ whiteSpace: "pre-wrap" }}>
              {review.comment && review.comment.trim().length > 0
                ? review.comment
                : "(Sin comentario)"}
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={isEdit && saving}>
          {isEdit ? "Cancelar" : "Volver"}
        </Button>
        {isEdit && (
          <Button
            onClick={onSave}
            disabled={saving || !review?.rating}
            variant='contained'
          >
            Guardar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
