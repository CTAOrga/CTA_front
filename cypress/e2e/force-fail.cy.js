describe("Forzar fallo para verificar artifacts", () => {
  it("debe fallar a propósito", () => {
    // Visita la Home y busca un texto que NO existe
    cy.visit("/");
    cy.contains("h1", "ESTE_TEXTO_NO_EXISTE_EN_HOME", { timeout: 1000 }).should(
      "be.visible"
    ); // ❌ va a fallar
  });
});
