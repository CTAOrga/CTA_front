import http from "./http";

export async function getReviewsByListing(listingId) {
  const { data } = await http.get(`/reviews/by-listing/${listingId}`);
  return data;
}

export async function createReview({ listingId, rating, comment }) {
  const { data } = await http.post("/reviews", {
    listing_id: listingId,
    rating,
    comment,
  });
  return data;
}

export async function getMyReviews({
  brand,
  model,
  minRating,
  dateFrom,
  dateTo,
} = {}) {
  const params = {};

  if (brand) params.brand = brand;
  if (model) params.model = model;
  if (minRating) params.min_rating = minRating;
  if (dateFrom) params.date_from = dateFrom; // "YYYY-MM-DD"
  if (dateTo) params.date_to = dateTo; // "YYYY-MM-DD"

  const { data } = await http.get("/reviews/my", { params });
  return data;
}

export async function updateReview(reviewId, { rating, comment }) {
  const { data } = await http.put(`/reviews/${reviewId}`, {
    rating,
    comment,
  });
  // Disparar evento para que otras pantallas (detalle, etc.) puedan refrescar si quieren
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("reviews:changed"));
  }
  return data;
}
