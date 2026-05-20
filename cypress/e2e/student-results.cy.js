describe('Student Results Page', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/results');
  });

  it('loads results page', () => {
    cy.url().should('include', '/dashboard/results');
    cy.contains('Submitted Assignments').should('be.visible');
  });

  it('shows Title and Percentage columns', () => {
    cy.contains('Title').should('be.visible');
    cy.contains('Percentage').should('be.visible');
  });

  it('shows Marks Obtained / Total Marks column', () => {
    cy.contains('Marks Obtained / Total Marks').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
