import http from "./http";

export async function searchAdminUsers({ page = 1, pageSize = 20, q, role }) {
  const params = {
    page,
    page_size: pageSize,
  };

  if (q) params.q = q;
  if (role && role !== "all") params.role = role; // "buyer" | "agency" | "admin"

  const { data } = await http.get("/admin/users", { params });
  return data; // { items, total, page, page_size }
}
