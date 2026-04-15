describe('About Page', () => {
  beforeEach(() => cy.visit('/about'));

  it('loads successfully', () => {
    cy.url().should('include', '/about');
  });

  it('shows About SQL Auto Grader heading', () => {
    cy.contains('About SQL Auto Grader').should('be.visible');
  });

  it('shows mission section', () => {
    cy.contains('Our Mission').should('be.visible');
  });

  it('shows contact email links', () => {
    cy.contains('General Inquiries').should('be.visible');
    cy.contains('Technical Support').should('be.visible');
    cy.get('a[href="mailto:info@sql-grader.com"]').should('exist');
    cy.get('a[href="mailto:support@sql-grader.com"]').should('exist');
  });
});
