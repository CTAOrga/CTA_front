import http from "./http";

export async function addFavorite(listingId) {
  const url = `/favorites/${encodeURIComponent(listingId)}`;
  const { data } = await http.post(url); // sin body
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("favorites:changed", {
        detail: { listingId, action: "added" },
      })
    );
  }
  return data ?? { ok: true };
}

export async function removeFavorite(listingId) {
  const url = `/favorites/${encodeURIComponent(listingId)}`;
  const { data } = await http.delete(url);
  if (typeof window !== "undefined") {
    window.dispatchEvent(
      new CustomEvent("favorites:changed", {
        detail: { listingId, action: "removed" },
      })
    );
  }
  return data ?? { ok: true };
}

export async function getMyFavorites({
  brand,
  model,
  agencyId,
  minPrice,
  maxPrice,
} = {}) {
  const params = {};

  if (brand) params.brand = brand;
  if (model) params.model = model;
  if (agencyId) params.agency_id = agencyId;
  if (minPrice != null && minPrice !== "") params.min_price = minPrice;
  if (maxPrice != null && maxPrice !== "") params.max_price = maxPrice;

  const { data } = await http.get("/favorites/my", { params });
  return data;
}
