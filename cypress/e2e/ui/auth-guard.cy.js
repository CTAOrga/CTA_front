import { createJwt } from "../../support/utils/authHelpers";

// Tests de UI con backend mockeado o sin llamar a backend.
// Verifican que RequireAuth proteja las rutas según el rol.

describe("AuthGuard / RequireAuth", () => {
  it("usuario no autenticado que visita /my-reviews es redirigido a /login", () => {
    cy.visit("/logout");
    cy.clearLocalStorage();

    cy.visit("/my-reviews");

    cy.url().should("include", "/login");
    cy.contains("Iniciar sesión").should("be.visible");
  });

  it("usuario no autenticado que visita /admin/favorites es redirigido a /login", () => {
    cy.clearLocalStorage();
    cy.visit("/admin/favorites");

    cy.url().should("include", "/login");
    cy.contains("Iniciar sesión").should("be.visible");
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

describe("Admin access", () => {
  it("usuario admin autenticado puede ver /admin/favorites", () => {
    const token = createJwt({ sub: "1", roles: ["admin"] });

    cy.intercept("GET", "**/api/v1/admin/favorites*", {
      statusCode: 200,
      body: {
        items: [],
        total: 0,
      },
    }).as("getAdminFavorites");

    cy.visit("/admin/favorites", {
      onBeforeLoad(win) {
        win.localStorage.setItem("access_token", token);
      },
    });

    cy.wait("@getAdminFavorites");

    cy.url().should("include", "/admin/favorites");
    cy.contains("Autos de interés guardados").should("be.visible");
    cy.contains("Nueva agencia").should("be.visible");
  });
});
