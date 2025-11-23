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

export async function getMyReviews() {
  const { data } = await http.get("/reviews/my");
  return data ?? [];
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
