import {
  createJwt,
  typeInByTestId,
  hexToRgbCss,
} from "../../support/utils/authHelpers";
import ROLE_TOKENS from "../../../src/theme/roles";

// Tests de UI (frontend + backend mockeado con cy.intercept)
// NO son E2E full-stack, solo verifican flujo de auth y tema por rol en el front.

describe("Auth - Login", () => {
  it("login exitoso redirige al Home como buyer", () => {
    const email = "buyer@test.com";
    const password = "123456";

    cy.intercept("POST", "**/auth/login", (req) => {
      expect(req.body).to.deep.equal({ email, password });

      const token = createJwt({ sub: "7", roles: ["buyer"] });

      req.reply({
        statusCode: 200,
        body: {
          access_token: token,
          token_type: "bearer",
          role: "buyer",
          roles: ["buyer"],
          agency_id: null,
        },
      });
    }).as("login");

    cy.visit("/login");

    typeInByTestId("login-email", email);
    typeInByTestId("login-password", password);

    cy.get('[data-testid="login-submit"]').click();
    cy.wait("@login");

    // 1) Estamos en Home
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);

    // 2) Sidebar de buyer presente
    cy.contains("a", "Inicio").should("be.visible");
    cy.contains("a", "Mis favoritos").should("be.visible");
    cy.contains("a", "Mis compras").should("be.visible");
    cy.contains("a", "Mis reseñas").should("be.visible");

    // 3) Ya no estamos en modo invitado:
    cy.contains("button", "iniciá sesión").should("not.exist");

    const buyerPrimaryHex = ROLE_TOKENS.buyer.palette.primary.main;
    const expectedColor = hexToRgbCss(buyerPrimaryHex);
    // 4) Verificamos el color de la AppBar para el rol 'buyer'
    cy.get('[data-testid="top-app-bar"]').should(
      "have.css",
      "background-color",
      expectedColor
    );
  });

  it("login con credenciales inválidas muestra mensaje de error", () => {
    const email = "invalido@mail.com";
    const password = "wrong";

    cy.intercept("POST", "**/auth/login", (req) => {
      expect(req.body).to.deep.equal({ email, password });
      req.reply({
        statusCode: 401,
        body: { detail: "Invalid credentials" },
      });
    }).as("loginFail");

    cy.visit("/login");

    typeInByTestId("login-email", email);
    typeInByTestId("login-password", password);

    cy.get('[data-testid="login-submit"]').click();
    cy.wait("@loginFail");

    // Login.jsx pone este mensaje en el catch
    cy.contains("Credenciales inválidas").should("be.visible");
    // Seguimos en /login
    cy.url().should("include", "/login");
  });
});
