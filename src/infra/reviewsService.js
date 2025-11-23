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
