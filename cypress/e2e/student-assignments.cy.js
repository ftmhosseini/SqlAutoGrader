describe('Student Assignments Page', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/assignments');
  });

  it('shows Assignments and Submitted Assignments tabs', () => {
    cy.contains('.react-tabs__tab', 'Assignments').should('be.visible');
    cy.contains('.react-tabs__tab', 'Submitted Assignments').should('be.visible');
  });

  it('Assignments tab is active by default', () => {
    cy.contains('.react-tabs__tab--selected', 'Assignments');
  });

  it('switches to Submitted Assignments tab', () => {
    cy.contains('.react-tabs__tab', 'Submitted Assignments').click();
    cy.contains('.react-tabs__tab--selected', 'Submitted Assignments');
  });

  it('shows marks and percentage columns in submitted tab', () => {
    cy.contains('.react-tabs__tab', 'Submitted Assignments').click();
    cy.contains('Marks Obtained').should('be.visible');
    cy.contains('Percentage').should('be.visible');
  });

  it('shows Back button in PageTitle', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Student Cohort Page', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/cohorts');
  });

  it('loads cohorts page', () => {
    cy.url().should('include', '/dashboard/cohorts');
    cy.contains('My Cohorts').should('be.visible');
  });

  it('shows Join Cohort button', () => {
    cy.contains('Join Cohort').should('be.visible');
  });

  it('shows join form when Join Cohort is clicked', () => {
    cy.contains('Join Cohort').click();
    cy.contains('Join a Cohort').should('be.visible');
    cy.get('input[placeholder="Enter cohort code..."]').should('be.visible');
  });

  it('shows error when joining with empty code', () => {
    cy.contains('Join Cohort').click();
    cy.contains('button', 'Join Cohort').last().click();
    cy.contains('Enter a cohort code').should('be.visible');
  });

  it('Cancel button hides the join form', () => {
    cy.contains('Join Cohort').click();
    cy.contains('Cancel').click();
    cy.contains('Join a Cohort').should('not.exist');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
