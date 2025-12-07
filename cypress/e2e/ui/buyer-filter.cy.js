// cypress/e2e/ui/buyer-filter.cy.js
import { createJwt } from "../../support/utils/authHelpers";

describe("Buyer - Filtro en Home", () => {
  it("aplica filtro por q y luego limpia los filtros", () => {
    const token = createJwt({ sub: "7", roles: ["buyer"] });

    // Interceptamos SOLO la API real de listings
    cy.intercept(
      "GET",
      /\/api\/v1\/listings.*/, // importante: apunta a la API, no al .js
      (req) => {
        const q = (req.query?.q || "").toString().toLowerCase();

        // Caso inicial / sin filtro (q vacío o undefined)
        if (!q) {
          req.reply({
            statusCode: 200,
            body: {
              items: [
                {
                  id: 1,
                  brand: "Peugeot",
                  model: "208 Like",
                  agency_id: 10,
                  current_price_amount: 12000,
                  current_price_currency: "USD",
                  stock: 3,
                  is_favorite: false,
                },
                {
                  id: 2,
                  brand: "Fiat",
                  model: "Cronos Drive",
                  agency_id: 11,
                  current_price_amount: 10000,
                  current_price_currency: "USD",
                  stock: 5,
                  is_favorite: false,
                },
              ],
              total: 2,
            },
          });
        }
        // Filtro por "peugeot"
        else if (q === "peugeot") {
          req.reply({
            statusCode: 200,
            body: {
              items: [
                {
                  id: 1,
                  brand: "Peugeot",
                  model: "208 Like",
                  agency_id: 10,
                  current_price_amount: 12000,
                  current_price_currency: "USD",
                  stock: 3,
                  is_favorite: false,
                },
              ],
              total: 1,
            },
          });
        }
        // Otro filtro cualquiera → sin resultados
        else {
          req.reply({
            statusCode: 200,
            body: { items: [], total: 0 },
          });
        }
      }
    ).as("searchListings");

    // Entramos al Home como buyer autenticado
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);
      },
    });

    // Primera carga (q vacío)
    cy.wait("@searchListings");

    // Comprobamos que se ven ambos autos
    cy.contains("Peugeot").should("be.visible");
    cy.contains("208 Like").should("be.visible");
    cy.contains("Fiat").should("be.visible");
    cy.contains("Cronos Drive").should("be.visible");

    // 🧩 Cambiamos el filtro q → esto dispara automáticamente runSearch
    cy.get('[data-testid="input-q"]').clear();
    cy.get('[data-testid="input-q"]').type("peugeot");

    // Nueva llamada de listings, ahora con q=peugeot
    cy.wait("@searchListings");

    // Solo debería quedar el Peugeot
    cy.contains("Peugeot").should("be.visible");
    cy.contains("208 Like").should("be.visible");
    cy.contains("Fiat").should("not.exist");
    cy.contains("Cronos Drive").should("not.exist");

    // Ahora probamos el botón "Limpiar"
    cy.contains("button", "Limpiar").click();

    // Eso resetea los filtros → nueva búsqueda con q vacío
    cy.wait("@searchListings");

    // Vuelven a aparecer ambos autos
    cy.contains("Peugeot").should("be.visible");
    cy.contains("208 Like").should("be.visible");
    cy.contains("Fiat").should("be.visible");
    cy.contains("Cronos Drive").should("be.visible");
  });
});
