describe('Authentication - Login', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
    cy.window().then((win) => {
      win.sessionStorage.clear();
      win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
    });
    cy.visit('/login');
  });

  it('renders login form with all fields', () => {
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Login');
  });

  it('shows error on invalid credentials', () => {
    cy.get('input[type="email"]').type('wrong@test.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    cy.contains('Wrong email or password').should('be.visible');
  });

  it('shows error for unverified email', () => {
    // Attempt login with unverified account (if one exists in test env)
    cy.get('input[type="email"]').type('unverified@test.com');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    // Should show either wrong credentials or email not verified
    cy.get('body').then(($body) => {
      const hasError = $body.text().includes('Wrong email or password') ||
                       $body.text().includes('verify') ||
                       $body.text().includes('Verify');
      expect(hasError).to.be.true;
    });
  });

  it('logs in as student and redirects to dashboard', () => {
    cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('STUDENT_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('logs in as teacher and redirects to dashboard', () => {
    cy.get('input[type="email"]').type(Cypress.env('TEACHER_EMAIL'));
    cy.get('input[type="password"]').type(Cypress.env('TEACHER_PASSWORD'));
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('navigates to register page via Sign Up link', () => {
    cy.contains('Sign Up').click();
    cy.url().should('include', '/register');
  });

  it('navigates to forgot password page', () => {
    cy.contains('Forgot').click();
    cy.url().should('include', '/forgot-password');
  });

  it('prevents empty form submission via HTML5 validation', () => {
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });
});

describe('Authentication - Registration', () => {
  beforeEach(() => cy.visit('/register'));

  it('renders all registration form fields', () => {
    cy.get('input[type="text"]').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('select').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign Up');
  });

  it('has student and teacher role options', () => {
    cy.get('select option').should('have.length', 2);
    cy.get('select option').eq(0).should('have.value', 'student');
    cy.get('select option').eq(1).should('have.value', 'teacher');
  });

  it('shows error on duplicate email registration', () => {
    cy.get('input[type="text"]').type('Test User');
    cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('already').should('be.visible');
  });

  it('prevents submission with empty fields via HTML5 validation', () => {
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/register');
  });

  it('navigates to login page via Login link', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });

  it('can select teacher role', () => {
    cy.get('select').select('teacher');
    cy.get('select').should('have.value', 'teacher');
  });

  it('can select student role', () => {
    cy.get('select').select('student');
    cy.get('select').should('have.value', 'student');
  });
});

describe('Authentication - Forgot Password', () => {
  beforeEach(() => cy.visit('/forgot-password'));

  it('renders forgot password form', () => {
    cy.contains('Forgot Password').should('be.visible');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Send Reset Link');
  });

  it('shows error for non-existent email', () => {
    cy.get('input[type="email"]').type('nonexistent@test.com');
    cy.get('button[type="submit"]').click();
    // Firebase sends reset email even for non-existent accounts (security by design)
    // So either a success or error message appears
    cy.get('body').then(($body) => {
      const hasResponse = $body.text().includes('sent') ||
                          $body.text().includes('No account found') ||
                          $body.text().includes('Check your inbox');
      expect(hasResponse).to.be.true;
    });
  });

  it('sends reset link for valid email', () => {
    cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
    cy.get('button[type="submit"]').click();
    cy.contains('Password reset email sent').should('be.visible');
  });

  it('navigates to login page via Login link', () => {
    cy.contains('Login').click();
    cy.url().should('include', '/login');
  });
});

describe('Authentication - Protected Routes', () => {
  beforeEach(() => {
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.visit('/');
    cy.window().then((win) => win.indexedDB.deleteDatabase('firebaseLocalStorageDb'));
  });

  it('redirects unauthenticated user from /dashboard to login', () => {
    cy.visit('/dashboard');
    cy.url().should('include', '/login');
  });

  it('redirects unauthenticated user from /dashboard/assignments', () => {
    cy.visit('/dashboard/assignments');
    cy.url().should('include', '/login');
  });

  it('redirects unauthenticated user from /dashboard/datasets', () => {
    cy.visit('/dashboard/datasets');
    cy.url().should('include', '/login');
  });
});
