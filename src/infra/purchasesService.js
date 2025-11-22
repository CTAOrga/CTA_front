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
export async function getMyPurchases() {
  const { data } = await http.get("/purchases/my");
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
