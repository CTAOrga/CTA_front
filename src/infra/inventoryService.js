import http from "./http";

// Lista inventario de la agencia logueada (paginado + filtros)
export async function getMyInventory({
  page = 1,
  pageSize = 20,
  brand,
  model,
  is_used,
} = {}) {
  const params = {
    page,
    page_size: pageSize,
  };

  if (brand) params.brand = brand;
  if (model) params.model = model;
  if (typeof is_used === "boolean") params.is_used = is_used;

  const { data } = await http.get("/inventory", { params });
  return data; // { items, total, page, page_size }
}

export async function createInventoryItem(payload) {
  // payload: { brand, model, quantity, is_used }
  const { data } = await http.post("/inventory", payload);
  return data;
}

export async function getInventoryItemById(id) {
  const { data } = await http.get(`/inventory/${id}`);
  return data;
}

export async function updateInventoryItem(id, payload) {
  const { data } = await http.patch(`/inventory/${id}`, payload);
  return data;
}

export function deleteInventoryItem(id) {
  return http.delete(`/inventory/${id}`);
}
