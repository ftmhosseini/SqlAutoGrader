describe('Teacher Cohorts Page', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/cohorts');
  });

  it('loads cohorts page', () => {
    cy.url().should('include', '/dashboard/cohorts');
    cy.contains('Cohort').should('be.visible');
  });

  it('shows cohort creation input', () => {
    cy.get('input').should('exist');
  });

  it('shows Create Cohort button', () => {
    cy.contains('Create Cohort').should('be.visible');
  });

  it('shows error when creating cohort with empty name', () => {
    cy.contains('Create Cohort').click();
    cy.contains('required').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
