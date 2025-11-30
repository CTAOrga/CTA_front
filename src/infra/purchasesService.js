import http from "./http";

// Crear compra
export async function createPurchase({ listingId, quantity = 1 }) {
  const { data } = await http.post("/purchases", {
    listing_id: listingId,
    quantity,
  });
  return data;
}

// Listar compras del comprador logueado
export async function getMyPurchases({
  status,
  listingId,
  minQty,
  maxQty,
  minPrice,
  maxPrice,
} = {}) {
  const params = {};

  if (status && status !== "all") {
    params.status = status; // "active" | "cancelled"
  }
  if (listingId) {
    params.listing_id = listingId;
  }
  if (minQty) {
    params.min_qty = minQty;
  }
  if (maxQty) {
    params.max_qty = maxQty;
  }
  if (minPrice) {
    params.min_price = minPrice;
  }
  if (maxPrice) {
    params.max_price = maxPrice;
  }

  const { data } = await http.get("/purchases/my", { params });
  return data;
}

// Cancelar compra
export async function cancelPurchase(purchaseId) {
  const { data } = await http.post(`/purchases/${purchaseId}/cancel`);
  return data;
}

// Reactivar compra
export async function reactivatePurchase(purchaseId) {
  const { data } = await http.post(`/purchases/${purchaseId}/reactivate`);
  return data;
}
