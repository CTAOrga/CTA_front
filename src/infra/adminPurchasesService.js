import http from "./http";

export async function getAdminPurchases({
  page = 1,
  pageSize = 20,
  q,
  status,
  dateFrom,
  dateTo,
}) {
  const params = {
    page,
    page_size: pageSize,
  };

  if (q) params.q = q;
  if (status && status !== "ALL") {
    params.status = status;
  }
  if (dateFrom) params.date_from = dateFrom; // "YYYY-MM-DD"
  if (dateTo) params.date_to = dateTo; // "YYYY-MM-DD"

  const { data } = await http.get("/admin/purchases", { params });
  return data; // { items, total, page, page_size }
}
