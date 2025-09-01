import http from "./http";

const ENDPOINT = "/agencies";
export async function createAgencyAdmin({ agencyName, email, password }) {
  const payload = {
    email,
    password,
    agency_name: agencyName,
  };

  const { data } = await http.post(ENDPOINT, payload);
  return data;
}
