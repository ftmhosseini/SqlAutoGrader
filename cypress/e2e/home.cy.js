describe('Home Page', () => {
  beforeEach(() => cy.visit('/'));

  it('shows hero section with title and Start Practicing button', () => {
    cy.contains('SQL Practice Platform').should('be.visible');
    cy.contains('Start Practicing').should('be.visible');
  });

  it('shows feature sections for teachers and students', () => {
    cy.contains('For Teachers').should('be.visible');
    cy.contains('For Students').should('be.visible');
    cy.contains('Dataset Manager').should('be.visible');
    cy.contains('SQL Tutor').should('be.visible');
  });

  it('shows Android download section', () => {
    cy.contains('Get the Mobile App').should('be.visible');
    cy.contains('Android').should('be.visible');
    cy.contains('Download APK').should('be.visible');
  });

  it('Start Practicing redirects unauthenticated user to login', () => {
    cy.contains('Start Practicing').click();
    cy.url().should('include', '/login');
  });

  it('navigates to login page from navbar', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('navigates to register page from navbar', () => {
    cy.contains('Register').click();
    cy.url().should('include', '/register');
  });
});
