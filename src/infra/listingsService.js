import http from "./http";

const num = (v) => (v === "" || v == null ? undefined : Number(v));
const str = (v) => (v === "" ? undefined : v);

export async function getListingById(id) {
  const response = await http.get(`/listings/${id}`);
  return response.data;
}

export async function searchListings({
  q,
  brand,
  model,
  agency_id,
  min_price,
  max_price,
  sort = "newest", // 'price_asc' | 'price_desc' | 'newest'
  page = 1, // backend usa 1-based
  page_size = 20,
} = {}) {
  const { data } = await http.get("/listings", {
    params: {
      q: str(q),
      brand: str(brand),
      model: str(model),
      agency_id: num(agency_id),
      min_price: num(min_price),
      max_price: num(max_price),
      sort,
      page,
      page_size,
    },
  });
  return data; // ideal: { items:[], total: N } o []
}
