import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "10s", target: 100 }, // subida brusca
    { duration: "20s", target: 100 }, // pico
    { duration: "10s", target: 0 }, // baja
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // tolera hasta 5% en pico
    http_req_duration: ["p(95)<1500"],
  },
};

const BASE = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function () {
  const res = http.get(`${BASE}/listings?page=1&page_size=20`);
  check(res, { "200 OK": (r) => r.status === 200 });
  sleep(1);
}
