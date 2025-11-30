import http from "./http";

export async function getMyInventory({
  page = 1,
  pageSize = 20,
  brand,
  model,
} = {}) {
  const params = {
    page,
    page_size: pageSize,
  };

  if (brand) params.brand = brand;
  if (model) params.model = model;

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
