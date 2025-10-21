describe("Página Principal", () => {
  it("debería cargar correctamente", () => {
    cy.visit("/");
    cy.contains("h1", "Bienvenido").should("be.visible");
  });
});
describe("Home - Filtro y Tabla", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/listings*", { fixture: "listings.json" }).as(
      "getListings"
    );
    cy.visit("/", {
      onBeforeLoad(win) {
        // --- genera un JWT válido para tu app ---
        const b64url = (o) =>
          btoa(JSON.stringify(o))
            .replace(/=+$/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        const header = { alg: "HS256", typ: "JWT" };
        const payload = {
          sub: "7", // un id cualquiera
          role: "buyer", // 👈 clave: tu app lo mapea a roles = ['buyer']
          exp: Math.floor(Date.now() / 1000) + 60 * 60, // +1h
        };

        const token = `${b64url(header)}.${b64url(payload)}.signature`;

        // --- lo mismo que haría tu login real ---
        win.localStorage.setItem("access_token", token);
        win.localStorage.setItem("roles", JSON.stringify(["buyer"]));
        win.localStorage.setItem(
          "session",
          JSON.stringify({
            access_token: token,
            token_type: "bearer",
            role: "buyer",
            agency_id: null,
            roles: ["buyer"],
            isAuthenticated: true,
          })
        );
      },
    }); // asumimos que Home está en '/'
    cy.wait("@getListings");
    // sanity: asegurá que montó la tabla
    cy.get('[data-testid="row-listing"]', { timeout: 10000 }).should("exist");
  });

  it("muestra la tabla con resultados", () => {
    cy.get('[data-testid="row-listing"]').should("have.length.at.least", 1);
  });

  it("filtra por texto (q) y vuelve a cargar", () => {
    cy.get('[data-testid="input-q"]').clear();
    cy.get('[data-testid="input-q"]').type("Fiat");
    cy.intercept("GET", "**/api/v1/listings*", (req) => {
      expect(req.query.q).to.eq("Fiat"); // valida el query param
      req.reply({ fixture: "listings.json" });
    }).as("getListingsQ");
    cy.get('[data-testid="btn-buscar"]').click();
    cy.wait("@getListingsQ");
  });
});
