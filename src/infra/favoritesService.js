import http from "./http";

// POST /api/v1/favorites/{listing_id}
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
  // si tu API responde 204 No Content, devolvemos algo usable igual
  return data ?? { ok: true };
}

// DELETE /api/v1/favorites/{listing_id}
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
