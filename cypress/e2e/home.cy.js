describe('Página Principal', () => {
    it('debería cargar correctamente', () => {
      cy.visit('/');
      cy.contains('h1', 'Bienvenido').should('be.visible');
    });
  });