import http from "./http";

/**
 * Mis ventas (como agencia)
 */
// Con filtro de cliente
export async function getMySales({ brand, model, customer, dateFrom, dateTo }) {
  const params = {};

  if (brand) params.brand = brand;
  if (model) params.model = model;
  if (customer) params.customer = customer;
  if (dateFrom) params.date_from = dateFrom; // "YYYY-MM-DD"
  if (dateTo) params.date_to = dateTo;

  const { data } = await http.get("/agencies/my-sales", { params });
  return data;
}

export async function getMyCustomers({ q, minPurchases, minSpent } = {}) {
  const params = {};

  if (q) params.q = q;
  if (minPurchases) params.min_purchases = minPurchases;
  if (minSpent) params.min_spent = minSpent;

  const { data } = await http.get("/agencies/my-customers", { params });
  return data;
}
