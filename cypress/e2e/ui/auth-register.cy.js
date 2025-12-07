import {
  createJwt,
  typeInByTestId,
  hexToRgbCss,
} from "../../support/utils/authHelpers";
import { ROLE_TOKENS } from "../../../src/theme/roles";

// Tests de UI (frontend + backend mockeado con cy.intercept)
// NO son E2E full-stack, solo verifican flujo de registro y tema por rol en el front.

describe("Auth - Registro", () => {
  it("registro exitoso hace login automático como buyer y aplica el color de buyer", () => {
    const email = "nuevo@test.com";
    const password = "123456";

    // 1) /auth/register
    cy.intercept("POST", "**/auth/register", (req) => {
      expect(req.body).to.deep.equal({ email, password });

      req.reply({
        statusCode: 201,
        body: {
          id: 123,
          email,
        },
      });
    }).as("register");

    // 2) login automático después del alta
    cy.intercept("POST", "**/auth/login", (req) => {
      expect(req.body).to.deep.equal({ email, password });

      const token = createJwt({ sub: "123", roles: ["buyer"] });

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
    }).as("loginAfterRegister");

    cy.visit("/register");

    typeInByTestId("register-email", email);
    typeInByTestId("register-password", password);
    cy.get('[data-testid="register-submit"]').click();

    cy.wait("@register");
    cy.wait("@loginAfterRegister");

    // Home buyer
    cy.url().should("eq", `${Cypress.config().baseUrl}/`);

    cy.contains("a", "Inicio").should("be.visible");
    cy.contains("a", "Mis favoritos").should("be.visible");
    cy.contains("a", "Mis compras").should("be.visible");
    cy.contains("a", "Mis reseñas").should("be.visible");

    cy.contains("button", "iniciá sesión").should("not.exist");

    // Color de barra = primary.main de buyer
    const buyerPrimaryHex = ROLE_TOKENS.buyer.palette.primary.main;
    const expectedColor = hexToRgbCss(buyerPrimaryHex);

    cy.get('[data-testid="top-app-bar"]').should(
      "have.css",
      "background-color",
      expectedColor
    );
  });

  it("fallo en registro muestra mensaje de error y se mantiene en /register", () => {
    const email = "ya-registrado@test.com";
    const password = "123456";

    cy.intercept("POST", "**/auth/register", (req) => {
      expect(req.body).to.deep.equal({ email, password });

      req.reply({
        statusCode: 400,
        body: { detail: "Email ya registrado" },
      });
    }).as("registerFail");

    cy.visit("/register");

    typeInByTestId("register-email", email);
    typeInByTestId("register-password", password);
    cy.get('[data-testid="register-submit"]').click();

    cy.wait("@registerFail");

    cy.contains("No se pudo registrar").should("be.visible");
    cy.url().should("include", "/register");
  });
});
