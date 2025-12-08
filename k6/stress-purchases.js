import http from "k6/http";
import { check, sleep } from "k6";
/*
export const options = {
  stages: [
    { duration: "30s", target: 5 }, // pocos buyers comprando
    { duration: "1m", target: 20 }, // pico razonable
    { duration: "1m", target: 40 }, // stress fuerte
    { duration: "30s", target: 0 }, // bajamos
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // toleramos hasta 5% errores en stress
    http_req_duration: ["p(95)<2000"], // 95% < 2s
  },
  noConnectionReuse: false,
  insecureSkipTLSVerify: true,
};

// API base y token de USUARIO BUYER (no admin)
const BASE_URL = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";
const USER_TOKEN = __ENV.USER_TOKEN || "";

// IDs de publicaciones válidas para comprar (ajustá según tus datos reales)
const listingsIds = [1, 2, 3, 4, 5];

export default function () {
  if (!USER_TOKEN) {
    console.error(
      "USER_TOKEN no definido. Pasalo por variable de entorno (buyer)."
    );
    return;
  }

  const listingId = listingsIds[Math.floor(Math.random() * listingsIds.length)];

  const url = `${BASE_URL}/purchases`;
  const payload = JSON.stringify({
    listing_id: listingId,
    quantity: 1,
  });

  const headers = {
    Authorization: `Bearer ${USER_TOKEN}`, // este token debe ser de rol buyer
    "Content-Type": "application/json",
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    "status es 201 o 200": (r) => r.status === 201 || r.status === 200,
    "respuesta es JSON": (r) =>
      r.headers["Content-Type"]?.includes("application/json"),
  });

  // simulamos que el buyer no compra TODO el tiempo
  sleep(0.5);
}
*/
