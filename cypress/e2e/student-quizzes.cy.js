describe('Student Quizzes Page', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/quizzes');
  });

  it('loads quizzes page', () => {
    cy.url().should('include', '/dashboard/quizzes');
  });

  it('shows Quizzes title', () => {
    cy.contains('Quizzes').should('be.visible');
  });

  it('shows Status and Action columns', () => {
    cy.contains('Status').should('be.visible');
    cy.contains('Action').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
