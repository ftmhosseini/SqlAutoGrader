describe('Student Dashboard', () => {
  beforeEach(() => cy.loginAsStudent());

  it('shows dashboard after login', () => {
    cy.url().should('include', '/dashboard');
  });

  it('shows student navigation items in sidebar', () => {
    cy.get('.sidebar').contains('Assignments').should('be.visible');
    cy.get('.sidebar').contains('Quizzes').should('be.visible');
    cy.get('.sidebar').contains('Submission').should('be.visible');
    cy.get('.sidebar').contains('SQL Tutor').should('be.visible');
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
    cy.get('.sidebar').contains('Assignments').should('be.visible');
    cy.get('.sidebar').contains('Cohorts').should('be.visible');
    cy.get('.sidebar').contains('Dataset Manager').should('be.visible');
  });

  it('shows teacher dashboard cards', () => {
    cy.contains('Students').should('be.visible');
    cy.contains('Assignments').should('be.visible');
    cy.contains('Needs Grading').should('be.visible');
  });
});
