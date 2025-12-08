import http from "k6/http";
import { check, sleep } from "k6";

// 1) Escenario de Stress para reportes admin
export const options = {
  stages: [
    { duration: "30s", target: 5 }, // pocos admins consultando
    { duration: "1m", target: 20 }, // carga moderada
    { duration: "1m", target: 50 }, // carga alta de reportes
    { duration: "30s", target: 0 }, // bajamos
  ],
  thresholds: {
    http_req_failed: ["rate<0.05"], // toleramos hasta 5% de fallos en stress
    http_req_duration: ["p(95)<2000"], // 95% < 2s porque los reportes pueden ser pesados
  },
  noConnectionReuse: false,
  insecureSkipTLSVerify: true,
};

// 2) API y token admin parametrizados por variables de entorno
const BASE_URL = __ENV.API_BASE_URL || "http://127.0.0.1:8000/api/v1";
const ADMIN_TOKEN = __ENV.ADMIN_TOKEN || "";

// 3) Opcional: distintos rangos de fechas para no siempre pegar igual
const dateRanges = [
  { from: "", to: "" }, // sin filtro de fechas
  { from: "2024-01-01", to: "2024-12-31" },
  { from: "2025-01-01", to: "2025-12-31" },
];

export default function () {
  if (!ADMIN_TOKEN) {
    // Si te olvidaste de pasar el token, esto te lo va a recordar en el log
    console.error("ADMIN_TOKEN no definido. Pasalo por variable de entorno.");
    return;
  }

  // 4) Elegimos un rango de fechas al azar
  const range = dateRanges[Math.floor(Math.random() * dateRanges.length)];

  // 5) Armamos query params
  const params = [];
  if (range.from) params.push(`date_from=${range.from}`);
  if (range.to) params.push(`date_to=${range.to}`);
  const queryString = params.length > 0 ? `?${params.join("&")}` : "";

  const url = `${BASE_URL}/admin/reports/top-sold-cars${queryString}`;

  // 6) Headers con Authorization
  const headers = {
    Authorization: `Bearer ${ADMIN_TOKEN}`,
  };

  // 7) Request al endpoint de reporte
  const res = http.get(url, { headers });

  // 8) Checks básicos
  check(res, {
    "status es 200": (r) => r.status === 200,
    "respuesta es JSON": (r) =>
      r.headers["Content-Type"]?.includes("application/json"),
  });

  // 9) Pausa muy corta: admins refrescando reportes
  sleep(0.5);
}
