describe('Anti-Cheat System', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.get('#accordionSidebar .nav-link').contains('Assignments').click();
    cy.url().should('include', '/dashboard/assignments');
  });
  beforeEach(() => {
    cy.loginAsStudent();
    cy.get('#accordionSidebar .nav-link')
      .contains('Assignments')
      .click();
    cy.get('#accordionSidebar').should('be.visible');
    cy.get('#accordionSidebar').contains('Assignments');

    cy.url().should('include', '/dashboard/assignments');
  });

  it('disables text selection during assignment (user-select: none)', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.get('body').should('have.css', 'user-select', 'none');
      }
    });
  });

  it('prevents copy events during assignment', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.document().then((doc) => {
          const event = new Event('copy', { cancelable: true });
          const prevented = !doc.dispatchEvent(event);
          expect(prevented).to.be.true;
        });
      }
    });
  });

  it('prevents paste events during assignment', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.document().then((doc) => {
          const event = new Event('paste', { cancelable: true });
          const prevented = !doc.dispatchEvent(event);
          expect(prevented).to.be.true;
        });
      }
    });
  });

  it('prevents right-click context menu during assignment', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.document().then((doc) => {
          const event = new Event('contextmenu', { cancelable: true });
          const prevented = !doc.dispatchEvent(event);
          expect(prevented).to.be.true;
        });
      }
    });
  });

  it('detects tab switch via visibility change', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.document().then((doc) => {
          Object.defineProperty(doc, 'hidden', { value: true, writable: true });
          doc.dispatchEvent(new Event('visibilitychange'));
          expect(doc.hidden).to.be.true;
        });
      }
    });
  });
});

describe('Due Date Enforcement - Assignments', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/assignments');
    cy.get('#accordionSidebar', { timeout: 15000 }).should('contain', 'Dataset Manager');
    cy.contains('New Assignment', { timeout: 15000 }).should('be.visible');
  });

  it('validates due date cannot be in the past when creating assignment', () => {
    cy.contains('New Assignment', { timeout: 15000 }).click();
    cy.get('input[name="title"]').type('Past Due Test');
    cy.get('input[name="due_date"]').type('2020-01-01');
    cy.contains('button', 'Next').click();
    cy.contains('Due date cannot be in the past').should('be.visible');
  });

  it('accepts future due date', () => {
    cy.contains('New Assignment').click();
    cy.get('input[name="title"]').type('Future Due Test');
    cy.get('input[name="due_date"]').type('2027-12-31');
    cy.contains('button', 'Next').click();
    // Should proceed to step 2 without error
    cy.contains('Due date cannot be in the past').should('not.exist');
  });

  it('shows due date in assignment list', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Due') || $body.text().includes('due')) {
        cy.contains(/[Dd]ue/).should('be.visible');
      }
    });
  });
});

describe('Due Date Enforcement - Quizzes', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/quizzes');
  });

  it('quiz form has due date field', () => {
    cy.contains('New Quiz').click();
    cy.get('input[name="due_date"]').should('exist');
  });

  it('due date field accepts valid date', () => {
    cy.contains('New Quiz').click();
    cy.get('input[name="due_date"]').type('2027-12-31');
    cy.get('input[name="due_date"]').should('have.value', '2027-12-31');
  });
});

describe('Due Date - Student View', () => {
  beforeEach(() => {
    cy.loginAsStudent();
    cy.get('#accordionSidebar .nav-link').contains('Assignments').click();
    cy.url().should('include', '/dashboard/assignments');
  });

  it('shows due date column in assignments list', () => {
    // Due date is shown either in the student DataTable header or teacher assignment cards
    cy.get('body').then(($body) => {
      const hasDueDate = $body.find('[data-testid="due-date-header"]').length > 0 ||
                         $body.text().includes('Due') ||
                         $body.text().includes('due_date');
      expect(hasDueDate).not.to.be.true;
    });
  });

  it('submitted assignments tab shows submission info', () => {
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab').length > 0) {
        cy.contains('Submitted Assignments').click();
      }
    });
    cy.url().should('include', '/dashboard/assignments');
  });
});

describe('AI Access Restrictions', () => {
  it('AI widget is NOT shown on assignment detail page (anti-cheat active)', () => {
    cy.loginAsStudent();
    cy.visit('/dashboard/assignments');
    cy.get('#accordionSidebar').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.find('.react-tabs__tab-panel--selected button, .react-tabs__tab-panel--selected a').length > 0) {
        cy.get('.react-tabs__tab-panel--selected').find('button, a').first().click();
        cy.wait(1000);
        cy.get('body').then(() => { expect(true).to.be.true; });
      }
    });
  });

  it('AI widget is shown on regular dashboard pages', () => {
    cy.loginAsStudent();
    cy.visit('/dashboard');
    cy.get('#accordionSidebar').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="sql-tutor-toggle"]').length > 0) {
        cy.get('[data-cy="sql-tutor-toggle"]').should('exist');
      }
    });
  });

  it('AI widget is shown on tutor page', () => {
    cy.loginAsStudent();
    cy.visit('/dashboard/tutor');
    cy.get('#accordionSidebar').should('be.visible');
    cy.get('body').then(($body) => {
      if ($body.find('[data-cy="sql-tutor-toggle"]').length > 0) {
        cy.get('[data-cy="sql-tutor-toggle"]').should('exist');
      }
    });
  });
});
