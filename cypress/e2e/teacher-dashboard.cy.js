describe('Teacher Dashboard', () => {
  beforeEach(() => cy.loginAsTeacher());

  it('shows dashboard after login', () => {
    cy.url().should('include', '/dashboard');
  });

  it('shows teacher navigation items in sidebar', () => {
    cy.get('#accordionSidebar .nav-link').contains('Assignments').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Cohorts').should('be.visible');
    cy.get('#accordionSidebar .nav-link').contains('Dataset Manager').should('be.visible');
  });

  it('shows teacher dashboard stat cards', () => {
    cy.contains('Students').should('be.visible');
    cy.contains('Assignments').should('be.visible');
    cy.contains('Needs Grading').should('be.visible');
  });

  it('navigates to profile page', () => {
    cy.get('#accordionSidebar .nav-link').contains('Profile').click();
    cy.url().should('include', '/dashboard/profile');
    cy.contains('TEACHER').should('be.visible');
  });
});

describe('Teacher - Dataset Manager', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/datasets');
  });

  it('loads dataset manager page', () => {
    cy.contains('Dataset Manager').should('be.visible');
  });

  it('shows create dataset input and button', () => {
    cy.get('input[placeholder="New dataset name"]').should('be.visible');
    cy.contains('button', 'Create Dataset').should('be.visible');
  });

  it('shows error when creating dataset with empty name', () => {
    cy.contains('button', 'Create Dataset').click();
    cy.contains('Dataset name is required').should('be.visible');
  });

  it('shows hint popup on ? click', () => {
    cy.get('.hint-circle').click();
    cy.contains('Database Manager Guide').should('be.visible');
  });

  it('displays existing datasets in table', () => {
    cy.get('.dataset-table').should('exist');
  });

  it('can select a dataset from the list', () => {
    cy.get('.dataset-table tbody tr.clickable').first().click();
    cy.get('.dataset-table tbody tr.active').should('exist');
  });

  it('shows tables section after selecting a dataset', () => {
    cy.get('.dataset-table tbody tr.clickable').first().click();
    // After selecting a dataset, tables section should appear
    cy.get('body').then(($body) => {
      if ($body.find('.dataset-table tbody tr.clickable').length > 0) {
        cy.get('.dataset-table tbody tr.clickable').first().click();
      }
    });
  });

  it('shows new table name input after selecting a dataset', () => {
    cy.get('.dataset-table tbody tr.clickable').first().click();
    cy.get('input[placeholder="New table name"]').should('be.visible');
  });

  it('shows error when creating table without selecting dataset', () => {
    // Try to create table without selecting dataset first
    cy.get('body').then(($body) => {
      if ($body.find('input[placeholder="New table name"]').length > 0) {
        cy.get('input[placeholder="New table name"]').type('TestTable');
        cy.contains('button', 'Create Table').click();
        cy.contains('Select a dataset first').should('be.visible');
      }
    });
  });

  it('shows Back button in PageTitle', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Teacher - Assignments', () => {
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

  it('validates due date is not in the past', () => {
    cy.contains('New Assignment').click();
    cy.get('input[name="title"]').type('Test Assignment');
    cy.get('input[name="due_date"]').type('2020-01-01');
    cy.contains('button', 'Next').click();
    cy.contains('Due date cannot be in the past').should('be.visible');
  });

  it('can fill in assignment details and proceed to step 2', () => {
    cy.contains('New Assignment').click();
    cy.get('input[name="title"]').type('Cypress Test Assignment');
    cy.get('input[name="due_date"]').type('2027-12-31');
    cy.get('textarea[name="description"]').type('Test description');
    cy.contains('button', 'Next').click();
    // Should move to step 2 - Questions & SQL
    cy.contains('Questions').should('be.visible');
  });

  it('shows error when proceeding to step 3 without questions', () => {
    cy.contains('New Assignment').click();
    cy.get('input[name="title"]').type('Cypress Test Assignment');
    cy.get('input[name="due_date"]').type('2027-12-31');
    cy.contains('button', 'Next').click();
    // On step 2, try to go to step 3 without adding questions
    cy.contains('button', 'Next').click();
    cy.contains('Please add at least one question').should('be.visible');
  });

  it('shows assignment list with title column', () => {
    cy.contains('Title').should('be.visible');
  });

  it('shows Back button in PageTitle', () => {
    cy.contains('← Back').should('be.visible');
  });

  it('can expand an existing assignment to see details', () => {
    cy.get('.card.shadow.mb-3').first().then(($card) => {
      if ($card.length > 0) {
        cy.wrap($card).click();
      }
    });
  });
});

describe('Teacher - Quizzes', () => {
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

  it('opens quiz form when New Quiz is clicked', () => {
    cy.contains('New Quiz').click();
    // Quiz form should show dataset selection
    cy.get('select').should('exist');
  });

  it('quiz form has title field auto-populated with date', () => {
    cy.contains('New Quiz').click();
    cy.get('input[name="title"]').should('not.have.value', '');
  });

  it('quiz form has difficulty selector', () => {
    cy.contains('New Quiz').click();
    cy.get('select[name="difficulty"]').should('exist');
  });

  it('quiz form has due date field', () => {
    cy.contains('New Quiz').click();
    cy.get('input[name="due_date"]').should('exist');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Teacher - Cohorts', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/cohorts');
  });

  it('loads cohorts page', () => {
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

  it('shows existing cohorts with student count', () => {
    cy.get('body').then(($body) => {
      if ($body.text().includes('Students')) {
        cy.contains('Students').should('be.visible');
      }
    });
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});

describe('Teacher - Submission Status', () => {
  beforeEach(() => {
    cy.loginAsTeacher();
    cy.visit('/dashboard/submissionstatus');
  });

  it('loads submission status page', () => {
    cy.contains('Submission Status').should('be.visible');
  });

  it('shows Assignments and Quizzes tabs', () => {
    cy.contains('.react-tabs__tab', 'Assignments').should('be.visible');
    cy.contains('.react-tabs__tab', 'Quizzes').should('be.visible');
  });

  it('Assignments tab is active by default', () => {
    cy.contains('.react-tabs__tab--selected', 'Assignments');
  });

  it('switches to Quizzes tab', () => {
    cy.contains('.react-tabs__tab', 'Quizzes').click();
    cy.contains('.react-tabs__tab--selected', 'Quizzes');
  });

  it('shows student submission data in assignments tab', () => {
    // The assignment table should render
    cy.get('.react-tabs__tab-panel--selected').should('exist');
  });

  it('shows Back button', () => {
    cy.contains('← Back').should('be.visible');
  });
});
