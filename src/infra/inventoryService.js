import http from "./http";

export const getInventory = async (filters = {}) => {
  const params = new URLSearchParams(filters).toString();
  const { data } = await http.get(`/agencies/inventory?${params}`);
  return data;
};

export const createInventory = (payload) => {
  return http.post(`/agencies/inventory`, payload);
};
