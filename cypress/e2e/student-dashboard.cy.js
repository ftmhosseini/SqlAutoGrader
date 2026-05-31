describe('Student Dashboard', () => {
  beforeEach(() => cy.loginAsStudent());

  it('shows dashboard after login', () => {
    cy.url().should('include', '/dashboard');
  });

  it('shows student navigation items in sidebar', () => {
    cy.get('#accordionSidebar .nav-link').contains('Assignments').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Quizzes').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('SQL Tutor').should('be.visible');
  });

  it('shows student stat cards', () => {
    cy.contains('Assignments (Total)').should('be.visible');
    cy.contains('Total Quizzes').should('be.visible');
  });

  it('navigates to profile and shows STUDENT role', () => {
    cy.get('#accordionSidebar .nav-link').contains('Profile').click();
    cy.url().should('include', '/dashboard/profile');
    cy.contains('STUDENT').should('be.visible');
  });
});

describe('Student - Assignments', () => {
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
    cy.contains('Marks Obtained / Total').should('be.visible');
    cy.contains('Percentage').should('be.visible');
  });

  it('shows assignment titles in the list', () => {
    cy.contains('Title').should('be.visible');
  });

  it('shows due date column', () => {
    cy.contains('Due Date').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Student - Quizzes', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/quizzes');
  });

  it('loads quizzes page', () => {
    cy.url().should('include', '/dashboard/quizzes');
    cy.contains('Quizzes').should('be.visible');
  });

  it('shows Status and Action columns', () => {
    cy.contains('Status').should('be.visible');
    cy.contains('Action').should('be.visible');
  });

  it('shows quiz titles', () => {
    cy.contains('Title').should('be.visible');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Student - Results', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/results');
  });

  it('loads results page', () => {
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

  it('can click on a result to see submitted questions', () => {
    cy.get('table tbody tr').first().then(($row) => {
      if ($row.length > 0 && $row.find('button, a').length > 0) {
        cy.wrap($row).find('button, a').first().click();
        cy.url().should('include', '/dashboard/results/');
      }
    });
  });
});

describe('Student - Cohort Join', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/cohorts');
  });

  it('loads cohorts page', () => {
    cy.contains('My Cohorts').should('be.visible');
  });

  it('shows Join Cohort button', () => {
    cy.contains('Join Cohort').should('be.visible');
  });

  it('shows join form when Join Cohort is clicked', () => {
    cy.contains('Join Cohort').first().click();
    cy.contains('Join a Cohort').should('be.visible');
    cy.get('input[placeholder="Enter cohort code..."]').should('be.visible');
  });

  it('shows error when joining with empty code', () => {
    cy.contains('Join Cohort').first().click();
    cy.get('.card-body').contains('button', 'Join Cohort').click();
    cy.contains('Enter a cohort code').should('be.visible');
  });

  it('shows error when joining with invalid code', () => {
    cy.contains('Join Cohort').first().click();
    cy.get('input[placeholder="Enter cohort code..."]').type('INVALID_CODE_XYZ');
    cy.get('.card-body').contains('button', 'Join Cohort').click();
    // Should show error about invalid/not found cohort
    cy.get('body').then(($body) => {
      const hasError = $body.text().includes('not found') ||
                       $body.text().includes('Invalid') ||
                       $body.text().includes('does not exist');
      expect(hasError).to.be.true;
    });
  });

  it('Cancel button hides the join form', () => {
    cy.contains('Join Cohort').first().click();
    cy.contains('Cancel').click();
    cy.contains('Join a Cohort').should('not.exist');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Student - SQL Tutor', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard/tutor');
  });

  it('loads SQL Tutor page', () => {
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

describe('Student - AI Tutor Widget', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard');
  });

  it('shows floating AI widget button', () => {
    cy.get('[style*="position: fixed"]').should('exist');
  });

  it('opens chat widget when floating button is clicked', () => {
    // Click the floating robot button
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.contains('SQL Tutor').should('be.visible');
  });

  it('shows suggested questions when chat is empty', () => {
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.contains('What is a JOIN?').should('be.visible');
    cy.contains('Explain GROUP BY').should('be.visible');
  });

  it('has input field and Send button', () => {
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.get('input[placeholder="Ask a SQL question..."]').should('be.visible');
    cy.contains('button', 'Send').should('be.visible');
  });

  it('can close the widget', () => {
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.contains('SQL Tutor').should('be.visible');
    // Click the × button in the header
    cy.get('[style*="position: fixed"]').find('button').first().click();
  });
});

describe('Student - AI Rate Limit', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.visit('/dashboard');
  });

  it('shows rate limit message when AI returns 429', () => {
    cy.interceptAIRateLimit();
    // Open the widget
    cy.get('[style*="position: fixed"]').find('button').last().click();
    // Type and send a message
    cy.get('input[placeholder="Ask a SQL question..."]').type('What is SQL?');
    cy.contains('button', 'Send').click();
    cy.wait('@aiRateLimited');
    // Should show the rate limit message
    cy.contains("finished today's usage").should('be.visible');
  });

  it('shows AI response on successful request', () => {
    cy.interceptAI(200, { content: 'SQL stands for Structured Query Language.' });
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.get('input[placeholder="Ask a SQL question..."]').type('What is SQL?');
    cy.contains('button', 'Send').click();
    cy.wait('@aiRequest');
    cy.contains('SQL stands for Structured Query Language').should('be.visible');
  });

  it('shows Thinking... while waiting for AI response', () => {
    cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', (req) => {
      req.reply({ delay: 2000, statusCode: 200, body: { choices: [{ message: { content: 'Response' } }] } });
    }).as('slowAI');
    cy.get('[style*="position: fixed"]').find('button').last().click();
    cy.get('input[placeholder="Ask a SQL question..."]').type('Explain JOIN');
    cy.contains('button', 'Send').click();
    cy.contains('Thinking...').should('be.visible');
  });
});
