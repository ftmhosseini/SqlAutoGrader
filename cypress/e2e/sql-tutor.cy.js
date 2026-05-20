describe('SQL Tutor Page', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/tutor');
  });

  it('loads SQL Tutor page', () => {
    cy.url().should('include', '/dashboard/tutor');
    cy.contains('SQL Tutor').should('be.visible');
  });

  it('shows Lessons and Quiz tabs', () => {
    cy.contains('📖 Lessons').should('be.visible');
    cy.contains('🎯 Quiz').should('be.visible');
  });

  it('shows lesson list in sidebar', () => {
    cy.contains('SELECT – Fetch Data').should('be.visible');
    cy.contains('JOIN – Combine Tables').should('be.visible');
  });

  it('shows Run button in lessons tab', () => {
    cy.contains('▶ Run').should('be.visible');
  });

  it('switches to Quiz tab and shows Generate Quiz button', () => {
    cy.contains('🎯 Quiz').click();
    cy.contains('Generate Quiz').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('SQL Tutor Widget', () => {
  it('shows floating widget on non-evaluation dashboard pages', () => {
    cy.loginAsStudent();
    cy.visit('/dashboard');
    // Widget uses inline styles with position:fixed, no class name
    cy.get('[style*="position: fixed"]').should('exist');
  });
});
