describe('Register Page', () => {
  beforeEach(() => cy.visit('/register'));

  it('renders all form fields', () => {
    cy.get('input[type="text"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('select').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign Up');
  });

  it('has student and teacher role options', () => {
    cy.get('select').find('option').should('have.length', 2);
    cy.get('select').find('option').eq(0).should('have.value', 'student');
    cy.get('select').find('option').eq(1).should('have.value', 'teacher');
  });

  it('navigates to login page via Login link', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('shows error on duplicate email', () => {
    cy.get('input[type="text"]').type('Test User');
    cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('already').should('be.visible');
  });

  it('shows error when submitting empty form', () => {
    cy.get('button[type="submit"]').click();
    // HTML5 validation or custom error should prevent submission
    cy.url().should('include', '/register');
  });
});
