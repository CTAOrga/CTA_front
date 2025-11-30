import http from "./http";

export async function getAdminReviews({
  page = 1,
  pageSize = 20,
  q,
  minRating,
  maxRating,
  dateFrom,
  dateTo,
}) {
  const params = {
    page,
    page_size: pageSize,
  };

  if (q) params.q = q;
  if (minRating != null && minRating !== "") params.min_rating = minRating;
  if (maxRating != null && maxRating !== "") params.max_rating = maxRating;
  if (dateFrom) params.date_from = dateFrom; // "YYYY-MM-DD"
  if (dateTo) params.date_to = dateTo; // "YYYY-MM-DD"

  const { data } = await http.get("/admin/reviews", { params });
  return data; // { items, total, page, page_size }
}
