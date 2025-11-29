import http from "./http";

export async function getAdminFavorites({ page, pageSize, q }) {
  const params = {
    page,
    page_size: pageSize,
  };
  if (q) params.q = q;

  const { data } = await http.get("/admin/favorites", { params });
  return data;
}
