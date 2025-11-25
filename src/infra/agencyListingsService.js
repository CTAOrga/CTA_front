import http from "./http";

export async function getMyListings({ page = 1, pageSize = 10 } = {}) {
  const { data } = await http.get(
    `/agencies/my-listings?page=${page}&page_size=${pageSize}`
  );
  return data;
}

export const getMyListingById = (id) => {
  return http.get(`/agencies/my-listings/${id}`);
};

export async function cancelListing(id) {
  await http.post(`/listings/${id}/cancel`);
}

export async function activateListing(id) {
  await http.post(`/listings/${id}/activate`);
}

export async function deleteListing(id) {
  await http.delete(`/listings/${id}`);
}

export const updateListing = (id, payload) => {
  return http.patch(`/listings/${id}`, payload);
};

export async function createListing(payload) {
  const { data } = await http.post("/listings", payload);
  return data;
}
