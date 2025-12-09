// ----------------------------------------------------------
// Stress de COMPRAS construyendo TODO el escenario desde k6:
// - Lee /car-models para obtener modelos de auto (sembrados en seed_perf).
// - Con el AGENCY_TOKEN crea items de inventario.
// - Con ese inventario crea listings/ofertas.
// - Con el BUYER_TOKEN hace compras sobre esos listings bajo carga.
//
// ⚠️ Correr SIEMPRE contra la API que apunta a la BD PERF (cta_perf).
// ⚠️ Requiere:
//   - AGENCY_TOKEN (JWT de agency_perf@cta.com)
//   - BUYER_TOKEN  (JWT de buyer_perf@cta.com)
// ----------------------------------------------------------

import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 5 }, // pocos buyers comprando
    { duration: "1m", target: 20 }, // pico razonable
    { duration: "1m", target: 40 }, // stress fuerte
    { duration: "30s", target: 0 }, // bajamos
  ],
  thresholds: {
    // Permitimos hasta ~10% de fallos HTTP, pero con los stocks configurados
    // deberías estar mucho más abajo (2-4% aprox).
    http_req_failed: ["rate<0.10"],
    http_req_duration: ["p(95)<2000"],
  },
  noConnectionReuse: false,
  insecureSkipTLSVerify: true,
};

const BASE_URL =
  __ENV.API_BASE_URL_PERF ||
  __ENV.API_BASE_URL ||
  "http://127.0.0.1:8000/api/v1";
const AGENCY_TOKEN = __ENV.AGENCY_TOKEN || "";
const BUYER_TOKEN = __ENV.BUYER_TOKEN || "";

const N_MODELS = 3; // cuántos car_models usamos para crear ofertas
const INVENTORY_QTY = 2200; // cantidad en inventario para cada modelo
const LISTING_STOCK = 2100; // stock inicial de cada oferta (<= INVENTORY_QTY)

// ----------------------------------------------------------
// setup(): se ejecuta UNA vez antes de todo el escenario.
// - Verifica tokens.
// - Lee car-models.
// - Crea inventario para algunos car_models.
// - Crea listings a partir de ese inventario.
// - Devuelve los IDs de listings para el default().
// ----------------------------------------------------------
export function setup() {
  if (!AGENCY_TOKEN || !BUYER_TOKEN) {
    throw new Error(
      "AGENCY_TOKEN y/o BUYER_TOKEN no definidos. " +
        "Definilos en el entorno antes de correr el test."
    );
  }

  const agencyHeaders = {
    Authorization: `Bearer ${AGENCY_TOKEN}`,
    "Content-Type": "application/json",
  };

  // 1) Leer car-models de la BD PERF (sembrados por seed_perf)
  const carModelsRes = http.get(`${BASE_URL}/car-models?page=1&page_size=50`, {
    headers: agencyHeaders,
  });

  check(carModelsRes, {
    "GET /car-models 200": (r) => r.status === 200,
  });

  let carModels;
  try {
    carModels = carModelsRes.json();
  } catch (e) {
    console.error("No se pudo parsear JSON de /car-models:", e);
    carModels = [];
  }

  if (!Array.isArray(carModels) || carModels.length === 0) {
    throw new Error(
      "No hay car-models en la BD PERF. Revisá seed_perf o seed_demo."
    );
  }

  const selectedModels = carModels.slice(0, 3);

  // 2) Crear items de inventario para esos car_models
  const inventoryItems = [];

  for (const cm of selectedModels) {
    const payload = JSON.stringify({
      car_model_id: cm.id,
      brand: cm.brand,
      model: cm.model,
      quantity: INVENTORY_QTY, // ej. 2200 unidades reales en inventario
    });

    const invRes = http.post(`${BASE_URL}/inventory`, payload, {
      headers: agencyHeaders,
    });

    check(invRes, {
      "inventario creado 201": (r) => r.status === 201,
    });

    try {
      const invBody = invRes.json();
      if (invBody && invBody.id) {
        inventoryItems.push(invBody);
      }
    } catch (e) {
      console.error("No se pudo parsear JSON de creación de inventario:", e);
    }
  }

  if (inventoryItems.length === 0) {
    throw new Error(
      "No se pudieron crear items de inventario para el test de perf."
    );
  }

  // 3) Crear listings/ofertas para esos items de inventario
  const listingIds = [];

  for (const inv of inventoryItems) {
    const payload = JSON.stringify({
      inventory_id: inv.id,
      current_price_amount: 12000,
      current_price_currency: "USD",
      brand: inv.brand,
      model: inv.model,
      // stock de la oferta: un poco menor que INVENTORY_QTY
      // para cumplir: payload.stock <= inv.quantity
      stock: Math.min(inv.quantity ?? INVENTORY_QTY, LISTING_STOCK),
      seller_notes: "PERF_K6_STRESS_PURCHASES",
    });

    const listRes = http.post(`${BASE_URL}/listings`, payload, {
      headers: agencyHeaders,
    });

    check(listRes, {
      "listing creado 201": (r) => r.status === 201,
    });

    try {
      const body = listRes.json();
      if (body && body.id) {
        listingIds.push(body.id);
      }
    } catch (e) {
      console.error("No se pudo parsear JSON de creación de listing:", e);
    }
  }

  if (listingIds.length === 0) {
    throw new Error(
      "No se pudieron crear listings para el test de stress de compras."
    );
  }

  console.log(
    `Listings creados para stress de compras: ${listingIds.join(", ")}`
  );

  return { listingIds };
}

// ----------------------------------------------------------
// default(data): ejecutado por cada VU en cada iteración.
// - Toma un listing_id de los creados en setup().
// - Hace POST /purchases con quantity=1 usando BUYER_TOKEN.
// ----------------------------------------------------------
export default function (data) {
  const listingIds = data.listingIds || [];

  if (!BUYER_TOKEN) {
    console.error(
      "BUYER_TOKEN no definido. Pasalo por variable de entorno (token de buyer_perf)."
    );
    return;
  }

  if (!listingIds.length) {
    console.error(
      "No hay listingIds en data. Revisá el setup() de stress-purchases.js."
    );
    return;
  }

  const listingId = listingIds[Math.floor(Math.random() * listingIds.length)];

  const url = `${BASE_URL}/purchases`;
  const payload = JSON.stringify({
    listing_id: listingId,
    quantity: 1,
  });

  const headers = {
    Authorization: `Bearer ${BUYER_TOKEN}`,
    "Content-Type": "application/json",
  };

  const res = http.post(url, payload, { headers });

  check(res, {
    // La mayoría deberían ser 201, pero aceptamos que algunas sean 400 por stock agotado
    "compra exitosa (201) o rechazada por stock (400)": (r) =>
      r.status === 201 ||
      (r.status === 400 &&
        (r.json("detail") ?? "").toString().toLowerCase().includes("stock")),
    "respuesta es JSON": (r) =>
      r.headers["Content-Type"]?.includes("application/json"),
  });

  sleep(0.5);
}
