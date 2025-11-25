import http from "./http";

/**
 * Mis ventas (como agencia)
 */
export async function getMySales() {
  const { data } = await http.get("/agencies/my-sales");
  return data;
}

/**
 * Mis clientes (como agencia)
 */
export async function getMyCustomers() {
  const { data } = await http.get("/agencies/my-customers");
  return data;
}
