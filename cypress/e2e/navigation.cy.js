describe('Navigation', () => {
  it('redirects unauthenticated user from /dashboard to /login', () => {
    cy.visit('http://localhost:3000/dashboard');
    cy.url().should('include', '/login');
  });

  it('navbar logo navigates to home', () => {
    cy.visit('http://localhost:3000/login');
    cy.get('nav').contains('SQL Practice Platform').click();
    cy.url().should('eq', 'http://localhost:3000/');
  });

  it('About link works from navbar on desktop', () => {
    cy.viewport(1280, 800);
    cy.visit('http://localhost:3000');
    cy.get('nav').contains('About').click();
    cy.url().should('include', '/about');
  });

  it('hamburger menu appears on small screen', () => {
    cy.viewport(500, 800);
    cy.visit('http://localhost:3000');
    cy.get('.hamburger').should('be.visible').click();
    cy.get('.nav-links.open').should('be.visible');
  });

  it('hamburger menu shows Home, About links', () => {
    cy.viewport(500, 800);
    cy.visit('http://localhost:3000');
    cy.get('.hamburger').click();
    cy.get('.nav-links.open').contains('Home').should('be.visible');
    cy.get('.nav-links.open').contains('About').should('be.visible');
  });
});
