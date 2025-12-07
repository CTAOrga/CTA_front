import { createJwt } from "../../support/utils/authHelpers";

// Tests de UI con backend mockeado o sin llamar a backend.
// Verifican que RequireAuth proteja las rutas según el rol.

describe("AuthGuard / RequireAuth", () => {
  it("usuario no autenticado que visita /my-favorites es redirigido a /login", () => {
    cy.visit("/logout");
    cy.clearLocalStorage();

    cy.visit("/my-reviews");

    cy.url().should("include", "/login");
    cy.contains("Iniciar sesión").should("be.visible");
  });

  it("usuario no autenticado que visita /admin/reports es redirigido a /login", () => {
    cy.clearLocalStorage();
    cy.visit("/admin/favorites");

    cy.url().should("include", "/login");
    cy.contains("Iniciar sesión").should("be.visible");
  });

  it("usuario buyer NO puede ver /admin/reports aunque esté logueado", () => {
    const session = {
      access_token: "dummy",
      role: "buyer",
      roles: ["buyer"],
      isAuthenticated: true,
      agency_id: null,
    };
    localStorage.setItem("session", JSON.stringify(session));
    localStorage.setItem("roles", JSON.stringify(["buyer"]));

    cy.visit("/admin/reviews");

    cy.url().should("not.include", "/admin/reviews");
    cy.url().should("include", "/login");
  });
});

describe("Routing - 404", () => {
  it("ruta inexistente muestra página 404 incluso sin estar logueado", () => {
    cy.clearLocalStorage();

    cy.visit("/esto-no-existe", { failOnStatusCode: false });

    cy.contains("Página no encontrada").should("be.visible");
  });

  it("usuario buyer autenticado NO puede ver secciones admin y ve /403", () => {
    const token = createJwt({ sub: "7", roles: ["buyer"] });

    // Seteamos el JWT ANTES de que la app se monte
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);
      },
    });

    // Ahora el AuthProvider te ve como buyer logueado
    cy.visit("/admin/favorites");

    cy.url().should("include", "/403");
    cy.contains("No tenés permisos").should("be.visible");
  });
});
