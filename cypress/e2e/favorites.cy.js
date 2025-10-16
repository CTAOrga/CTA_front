describe("Favoritos en tabla", () => {
  beforeEach(() => {
    cy.intercept("GET", "**/api/v1/listings*", { fixture: "listings.json" }).as(
      "getListings"
    );
    cy.visit("/");
    cy.wait("@getListings");
  });

  it("marca y desmarca favorito por fila", () => {
    // Primera fila: si no es favorito, se verá StarBorder
    cy.get('[data-testid="row-listing"]').first().as("firstRow");

    // Marcar
    cy.intercept("POST", "**/api/v1/favorites/*", { statusCode: 200 }).as(
      "favAdd"
    );
    cy.get("@firstRow").find('[data-testid="btn-fav"]').click();
    cy.wait("@favAdd");
    // UI optimista: ahora debería mostrar estrella llena en la celda
    cy.get("@firstRow")
      .find('[data-testid="cell-fav"] svg[data-testid="StarIcon"]')
      .should("exist");

    // Desmarcar
    cy.intercept("DELETE", "**/api/v1/favorites/*", { statusCode: 200 }).as(
      "favDel"
    );
    cy.get("@firstRow").find('[data-testid="btn-fav"]').click();
    cy.wait("@favDel");
    // Debería volver a StarBorder
    cy.get("@firstRow")
      .find('[data-testid="cell-fav"] svg[data-testid="StarBorderIcon"]')
      .should("exist");
  });
});
