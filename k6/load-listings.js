import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  // Carga gradual (Load)
  stages: [
    { duration: "30s", target: 10 }, // rampa a 10 VUs
    { duration: "1m", target: 10 }, // sostener 1 minuto
    { duration: "30s", target: 0 }, // bajar
  ],
  thresholds: {
    http_req_failed: ["rate<0.01"], // <1% fallos aceptable
    http_req_duration: ["p(95)<800"], // 95% de las req < 800ms
  },
  noConnectionReuse: false,
  insecureSkipTLSVerify: true,
};

const BASE = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function () {
  const res = http.get(`${BASE}/listings?page=1&page_size=20`);

  check(res, {
    "status 200": (r) => r.status === 200,
  });

  sleep(0.5);
}
