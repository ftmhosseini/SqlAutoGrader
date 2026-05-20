describe('Teacher Cohorts Page', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/cohorts');
  });

  it('loads cohorts page', () => {
    cy.url().should('include', '/dashboard/cohorts');
    cy.contains('Cohorts').should('be.visible');
  });

  it('shows New Cohort button', () => {
    cy.contains('New Cohort').should('be.visible');
  });

  it('opens create form when New Cohort is clicked', () => {
    cy.contains('New Cohort').click();
    cy.contains('Create New Cohort').should('be.visible');
    cy.get('input[placeholder="Enter cohort name..."]').should('be.visible');
  });

  it('shows Create Cohort submit button inside the form', () => {
    cy.contains('New Cohort').click();
    cy.contains('button', 'Create Cohort').should('be.visible');
  });

  it('Cancel button hides the create form', () => {
    cy.contains('New Cohort').click();
    cy.contains('Create New Cohort').should('be.visible');
    cy.contains('Cancel').click();
    cy.contains('Create New Cohort').should('not.exist');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
