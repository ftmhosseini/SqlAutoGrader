describe('Teacher Datasets Page', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/datasets');
  });

  it('loads dataset manager', () => {
    cy.url().should('include', '/dashboard/datasets');
    cy.contains('Dataset Manager').should('be.visible');
  });

  it('shows create dataset input and button on same row', () => {
    cy.get('input[placeholder="New dataset name"]').should('be.visible');
    cy.contains('button', 'Create Dataset').should('be.visible');
  });

  it('shows empty state when no dataset selected', () => {
    cy.contains('No datasets yet').should('be.visible');
  });

  it('shows hint popup on click', () => {
    cy.contains('?').click();
    cy.contains('Database Manager Guide').should('be.visible');
  });

  it('shows error when creating dataset with empty name', () => {
    cy.contains('button', 'Create Dataset').click();
    cy.contains('Dataset name is required').should('be.visible');
  });

  it('shows Back button in PageTitle', () => {
    cy.contains('← Back').should('be.visible');
  });
});
