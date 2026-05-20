describe('Teacher Assignments Page', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/assignments');
  });

  it('loads assignments page', () => {
    cy.url().should('include', '/dashboard/assignments');
  });

  it('shows New Assignment button', () => {
    cy.contains('New Assignment').should('be.visible');
  });

  it('opens assignment form with stepper steps', () => {
    cy.contains('New Assignment').click();
    cy.contains('Assignment Details').should('be.visible');
    cy.contains('Questions & SQL').should('be.visible');
    cy.contains('Assign & Publish').should('be.visible');
  });

  it('shows error when clicking Next without filling required fields', () => {
    cy.contains('New Assignment').click();
    cy.contains('button', 'Next').click();
    cy.contains('Please fill in the title and due date').should('be.visible');
  });

  it('shows assignment list with title column', () => {
    cy.contains('Title').should('be.visible');
  });

  it('shows Back button in PageTitle', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Teacher Quizzes Page', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/quizzes');
  });

  it('loads quizzes page', () => {
    cy.url().should('include', '/dashboard/quizzes');
  });

  it('shows New Quiz button', () => {
    cy.contains('New Quiz').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
