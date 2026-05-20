describe('Forgot Password Page', () => {
  beforeEach(() => cy.visit('/forgot-password'));

  it('renders forgot password form', () => {
    cy.contains('Forgot Password').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Send Reset Link');
  });

  it('shows error for non-existent email', () => {
    cy.get('input[type="email"]').type('nonexistent@test.com');
    cy.get('button[type="submit"]').click();
    cy.contains('No account found with that email').should('be.visible');
  });

  it('navigates to login page via Login link', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});
