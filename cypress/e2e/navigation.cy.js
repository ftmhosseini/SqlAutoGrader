describe('Navigation', () => {
  it('redirects unauthenticated user from /dashboard to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('navbar logo navigates to home', () => {
    cy.visit('/login');
    cy.get('nav').contains('SQL Practice Platform').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('About link works from navbar on desktop', () => {
    cy.viewport(1280, 800);
    cy.visit('/');
    cy.get('nav').contains('About').click();
    cy.url().should('include', '/about');
  });

  it('hamburger menu appears on small screen', () => {
    cy.viewport(500, 800);
    cy.visit('/');
    cy.get('.hamburger').should('be.visible').click();
    cy.get('.nav-links.open').should('be.visible');
  });

  it('hamburger menu shows Home and About links', () => {
    cy.viewport(500, 800);
    cy.visit('/');
    cy.get('.hamburger').click();
    cy.get('.nav-links.open').contains('Home').should('be.visible');
    cy.get('.nav-links.open').contains('About').should('be.visible');
  });

  it('student sidebar links navigate correctly', () => {
    cy.loginAsStudent();
    cy.get('#accordionSidebar .nav-link').contains('Assignments').click();
    cy.url().should('include', '/dashboard/assignments');
    cy.get('#accordionSidebar .nav-link').contains('Quizzes').click();
    cy.url().should('include', '/dashboard/quizzes');
    cy.get('#accordionSidebar .nav-link').contains('SQL Tutor').click();
    cy.url().should('include', '/dashboard/tutor');
  });

  it('teacher sidebar links navigate correctly', () => {
    cy.loginAsTeacher();
    cy.get('#accordionSidebar .nav-link').contains('Assignments').click();
    cy.url().should('include', '/dashboard/assignments');
    cy.get('#accordionSidebar .nav-link').contains('Cohorts').click();
    cy.url().should('include', '/dashboard/cohorts');
    cy.get('#accordionSidebar .nav-link').contains('Dataset Manager').click();
    cy.url().should('include', '/dashboard/datasets');
  });
});
