import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "30s", target: 40 },
    { duration: "30s", target: 80 },
    { duration: "30s", target: 120 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    http_req_failed: ["rate<0.02"], // 2% falla aceptable
    http_req_duration: ["p(95)<1200"],
  },
  noConnectionReuse: false,
  insecureSkipTLSVerify: true,
};

const BASE = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";

export default function () {
  const res = http.get(`${BASE}/listings?page=1&page_size=20`);
  check(res, { "200 OK": (r) => r.status === 200 });
  sleep(0.5);
}
