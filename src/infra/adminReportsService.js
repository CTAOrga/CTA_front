import http from "./http";

export async function getTopSoldCars({ dateFrom, dateTo, limit }) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom; // "YYYY-MM-DD"
  if (dateTo) params.date_to = dateTo;
  if (limit) params.limit = limit;

  const { data } = await http.get("/admin/reports/top-sold-cars", { params });
  return data; // [{ brand, model, units_sold, total_amount }, ...]
}

export async function getTopBuyers({ dateFrom, dateTo, limit }) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  if (limit) params.limit = limit;

  const { data } = await http.get("/admin/reports/top-buyers", { params });
  return data; // [{ email, purchases_count, total_spent }, ...]
}

export async function getTopFavorites({ dateFrom, dateTo, limit }) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  if (limit) params.limit = limit;

  const { data } = await http.get("/admin/reports/top-favorites", { params });
  return data; // [{ brand, model, favorites_count }, ...]
}

export async function getTopAgencies({ dateFrom, dateTo, limit }) {
  const params = {};
  if (dateFrom) params.date_from = dateFrom;
  if (dateTo) params.date_to = dateTo;
  if (limit) params.limit = limit;

  const { data } = await http.get("/admin/reports/top-agencies", { params });
  return data; // [{ agency_name, sales_count, total_amount }, ...]
}
