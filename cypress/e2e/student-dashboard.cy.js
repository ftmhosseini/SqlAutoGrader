describe('Student Area', () => {
  beforeEach(() => {
    cy.loginAsStudent();
  });
  describe('Student Dashboard', () => {

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
      cy.get('.profile-role', { timeout: 15000 }).should('not.be.empty');
      cy.contains('STUDENT').should('be.visible');
    });
  });

  describe('Student - Assignments', () => {
    beforeEach(() => {
      cy.visit('/dashboard/assignments');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
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
      cy.visit('/dashboard/quizzes');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
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
      cy.visit('/dashboard/results');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
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
      cy.get('body').then(($body) => {
        if ($body.find('table tbody tr').length > 0) {
          cy.get('table tbody tr').first().find('button, a').first().click();
          cy.url().should('include', '/dashboard/results/');
        }
      });
    });
  });

  describe('Student - Cohort Join', () => {
    beforeEach(() => {
      cy.visit('/dashboard/cohorts');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
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
      cy.contains('No cohort found with this code.').should('be.visible');
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
      cy.visit('/dashboard/tutor');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
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
      cy.visit('/dashboard');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
    });

    it('shows floating AI widget button', () => {
      cy.get('[data-cy="sql-tutor-toggle"]').should('exist');
    });

    it('opens chat widget when floating button is clicked', () => {
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.contains('SQL Tutor').should('be.visible');
    });

    it('shows suggested questions when chat is empty', () => {
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.contains('What is a JOIN?').should('be.visible');
      cy.contains('Explain GROUP BY').should('be.visible');
    });

    it('has input field and Send button', () => {
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.get('input[placeholder="Ask a SQL question..."]').should('be.visible');
      cy.contains('button', 'Send').should('be.visible');
    });

    it('can close the widget', () => {
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.contains('SQL Tutor').should('be.visible');
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.get('input[placeholder="Ask a SQL question..."]').should('not.exist');
    });
  });

  describe('Student - AI Rate Limit', () => {
    beforeEach(() => {
      cy.visit('/dashboard');
      cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
    });

    it('shows rate limit message when AI returns 429', () => {
      cy.interceptAIRateLimit();
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.get('input[placeholder="Ask a SQL question..."]').type('What is SQL?');
      cy.contains('button', 'Send').click();
      cy.wait('@aiRateLimited');
      cy.contains("finished today's usage").should('be.visible');
    });

    it('shows AI response on successful request', () => {
      cy.interceptAI(200, { content: 'SQL stands for Structured Query Language.' });
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.get('input[placeholder="Ask a SQL question..."]').type('What is SQL?');
      cy.contains('button', 'Send').click();
      cy.wait('@aiRequest');
      cy.contains('SQL stands for Structured Query Language').should('be.visible');
    });

    it('shows Thinking... while waiting for AI response', () => {
      cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', (req) => {
        req.reply({ delay: 2000, statusCode: 200, body: { choices: [{ message: { content: 'Response' } }] } });
      }).as('slowAI');
      cy.get('[data-cy="sql-tutor-toggle"]').click();
      cy.get('input[placeholder="Ask a SQL question..."]').type('Explain JOIN');
      cy.contains('button', 'Send').click();
      cy.contains('Thinking...').should('be.visible');
    });
  });
})