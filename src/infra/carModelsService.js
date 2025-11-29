import http from "./http";

export async function searchCarModels({ q }) {
  const { data } = await http.get("/car-models", {
    params: { q },
  });
  return data;
}
