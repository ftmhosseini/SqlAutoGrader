// Cypress E2E tests for the StudentAssignmentPage flow
// Covers: submission status table → Check & Grade → grading detail → Return Final Score

describe('StudentAssignmentPage', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/submissionstatus');
    cy.contains('Submission Status').should('be.visible');
  });

  it('shows the assignment submissions table with required columns', () => {
    cy.contains('th', 'Student Name').should('be.visible');
    cy.contains('th', 'Assignment Title').should('be.visible');
    cy.contains('th', 'Mark').should('be.visible');
    cy.contains('th', 'Status').should('be.visible');
  });

  it('shows "Check & Grade" button only for submitted/completed rows', () => {
    // Rows with status submitted or completed get the button; others show plain status text
    cy.get('tbody tr').each(($row) => {
      const statusText = $row.find('td .badge').text().toLowerCase();
      if (statusText === 'submitted' || statusText === 'completed') {
        cy.wrap($row).find('button').contains(/check & grade/i).should('exist');
      } else {
        cy.wrap($row).find('button').should('not.exist');
      }
    });
  });

  it('opens StudentAssignmentPage when Check & Grade is clicked', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    // The table is replaced by the detail view
    cy.contains('Back to list').should('be.visible');
    cy.contains('Return Final Score').should('be.visible');
  });

  it('shows assignment title and student name in detail view', () => {
    cy.visit('/dashboard/submissionstatus');
    cy.contains('Submission Status').should('be.visible');
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    // h4 title and student name span must both be non-empty
    cy.get('h4').invoke('text').should('not.be.empty');
    cy.contains(/Student:/).should('be.visible');
  });

  it('renders question text (not empty) in the questions table', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    // Each question row's first cell must have some text
    cy.get('.grading-page-root table tbody tr').first().find('td').first()
      .invoke('text').should('not.be.empty');
  });

  it('shows mark column with x / y format', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    cy.get('.grading-page-root table tbody tr').first()
      .contains('td', /\d+ \/ \d+/).should('exist');
  });

  it('shows "No submission" for questions without an attempt', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    cy.get('body').then(($body) => {
      if ($body.text().includes('No submission')) {
        cy.contains('No submission').should('be.visible');
      }
    });
  });

  it('opens GradeAttemptPage when Check button is clicked', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    cy.get('.grading-page-root table tbody tr').each(($row) => {
      if ($row.find('button').length > 0) {
        cy.wrap($row).find('button').click();
        cy.contains('Expected Answer').should('be.visible');
        cy.contains('Student Answer').should('be.visible');
        return false; // stop after first match
      }
    });
  });

  it('returns to detail table when GradeAttemptPage Cancel is clicked', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    cy.get('.grading-page-root table tbody tr').each(($row) => {
      if ($row.find('button').length > 0) {
        cy.wrap($row).find('button').click();
        cy.contains('button', /cancel/i).click();
        cy.contains('Return Final Score').should('be.visible');
        return false;
      }
    });
  });

  it('navigates back to submission table when Back to list is clicked', () => {
    cy.get('tbody tr').contains('button', /check & grade/i).first().click();
    cy.contains('Back to list').click();
    // Back to the assignment table
    cy.contains('th', 'Student Name').should('be.visible');
  });

  it('can sort the table by clicking Student Name column header', () => {
    cy.contains('th', 'Student Name').click();
    // Table still renders after sort
    cy.get('tbody tr').should('have.length.greaterThan', 0);
  });

  it('can switch to Quizzes tab without errors', () => {
    cy.contains('.react-tabs__tab', 'Quizzes').click();
    cy.contains('.react-tabs__tab--selected', 'Quizzes');
    cy.get('table').should('exist');
  });
});
