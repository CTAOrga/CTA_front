describe("Home - Filtro y Tabla", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/listings*", { fixture: "listings.json" }).as(
      "getListings"
    );
    cy.visit("/"); // asumimos que Home está en '/'
    cy.wait("@getListings");
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
