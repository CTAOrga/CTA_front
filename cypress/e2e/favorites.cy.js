describe("Favoritos en tabla", () => {
  beforeEach(() => {
    // 1) Interceptar ANTES del visit para capturar la 1ª carga
    cy.intercept("GET", "**/api/v1/listings*", { fixture: "listings.json" }).as(
      "getListings"
    );

    // 2) Visitar sembrando un JWT válido (buyer)
    cy.visit("/", {
      onBeforeLoad(win) {
        const b64 = (o) =>
          btoa(JSON.stringify(o))
            .replace(/=+$/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");
        const header = { alg: "HS256", typ: "JWT" };
        const payload = {
          sub: "7",
          role: "buyer",
          exp: Math.floor(Date.now() / 1000) + 3600,
        };
        const token = `${b64(header)}.${b64(payload)}.signature`;

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
    });

    // 3) Esperar data y que monte la tabla
    cy.wait("@getListings");
    cy.get('[data-testid="row-listing"]', { timeout: 10000 }).should("exist");
  });

  it("marca y desmarca favorito por fila", () => {
    // Por tu fixture, la primera fila tiene is_favorite = false
    cy.get('[data-testid="row-listing"]').first().as("row");

    // Marcar como favorito
    cy.intercept("POST", "**/api/v1/favorites/*", { statusCode: 200 }).as(
      "favAdd"
    );
    cy.get("@row").find('[data-testid="btn-fav"]').click();
    cy.wait("@favAdd");
    cy.get("@row")
      .find('[data-testid="cell-fav"] svg[data-testid="StarIcon"]')
      .should("exist");

    // Desmarcar
    cy.intercept("DELETE", "**/api/v1/favorites/*", { statusCode: 200 }).as(
      "favDel"
    );
    cy.get("@row").find('[data-testid="btn-fav"]').click();
    cy.wait("@favDel");
    cy.get("@row")
      .find('[data-testid="cell-fav"] svg[data-testid="StarBorderIcon"]')
      .should("exist");
  });
});
