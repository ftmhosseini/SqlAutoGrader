describe('Student Dashboard', () => {
  beforeEach(() => cy.loginAsStudent());

  it('shows dashboard after login', () => {
    cy.url().should('include', '/dashboard');
  });

  it('shows student navigation items in sidebar', () => {
    cy.get('#accordionSidebar .nav-link').contains('Assignments').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Quizzes').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('SQL Tutor').should('be.visible');
  });

  it('shows student stat cards', () => {
    cy.contains('Assignments (Total)').should('be.visible');
    cy.contains('Total Quizzes').should('be.visible');
  });
});

describe('Teacher Dashboard', () => {
  beforeEach(() => cy.loginAsTeacher());

  it('shows dashboard after login', () => {
    cy.url().should('include', '/dashboard');
  });

  it('shows teacher navigation items in sidebar', () => {
    cy.get('#accordionSidebar .nav-link').contains('Assignments').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Cohorts').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Dataset Manager').should('be.visible');
  });

  it('shows teacher dashboard cards', () => {
    cy.contains('Students').should('be.visible');
    cy.contains('Assignments').should('be.visible');
    cy.contains('Needs Grading').should('be.visible');
  });

  it('Profile link in sidebar navigates to profile page', () => {
    cy.get('#accordionSidebar .nav-link').contains('Profile').click();
    cy.url().should('include', '/dashboard/profile');
  });
});
