import { typeInByTestId } from "../../support/utils/authHelpers";

describe.skip("E2E real - buyer login + Mis favoritos", () => {
  const email = Cypress.env("E2E_BUYER_EMAIL");
  const password = Cypress.env("E2E_BUYER_PASSWORD");

  it("buyer puede loguearse y ver Mis favoritos usando el backend real", () => {
    // Sanity check de envs
    expect(email, "E2E_BUYER_EMAIL debe estar configurado").to.be.a("string")
      .and.not.be.empty;
    expect(password, "E2E_BUYER_PASSWORD debe estar configurado").to.be.a(
      "string"
    ).and.not.be.empty;

    // 1) Ir al login
    cy.visit("/login");

    // 2) Completar credenciales REALES del buyer
    typeInByTestId("login-email", email);
    typeInByTestId("login-password", password);

    cy.contains("button", "Entrar").click();

    // 3) Redirige al home
    cy.url().should("eq", `${Cypress.config("baseUrl")}/`);

    // 4) Intercept solo para ESPERAR la API real de favoritos
    cy.intercept("GET", /\/api\/v1\/favorites\/my.*/).as("getBuyerFavorites");

    // 5) Ir a Mis favoritos
    cy.contains("a", "Mis favoritos").click();

    // 6) Esperar la respuesta real
    cy.wait("@getBuyerFavorites");

    // 7) Asserts de la pantalla
    cy.url().should("include", "/my-favorites");
    cy.contains("Mis favoritos").should("be.visible");

    // Si sabés que tiene al menos 1 favorito:
    cy.get('[data-testid="row-favorite"]').should("have.length.at.least", 1);
  });
});
