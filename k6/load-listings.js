import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  // Carga gradual (Load)
  stages: [
    { duration: "30s", target: 10 }, // rampa a 10 VUs
    { duration: "1m", target: 10 }, // sostener
    { duration: "30s", target: 0 }, // bajar
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% fallos
    http_req_duration: ["p(95)<800"], // 95% bajo 800 ms
  },
};

const BASE = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";

/** Pequeño helper para armar query strings en k6 */
function qstr(obj) {
  return Object.entries(obj)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

export default function () {
  const qs = qstr({
    page: 1,
    page_size: 20,
    sort: "newest",
    q: "Fiat",
  });

  const res = http.get(`${BASE}/listings?${qs}`);

  check(res, {
    "status 200": (r) => r.status === 200,
    "json válido": (r) => {
      try {
        JSON.parse(r.body);
        return true;
      } catch {
        return false;
      }
    },
  });

  sleep(1);
}
