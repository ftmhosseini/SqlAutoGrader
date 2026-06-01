// // --- Authentication Commands ---
// Cypress.Commands.add('loginAsStudent', () => {
//   cy.session(Cypress.env('STUDENT_EMAIL'), () => {
//     cy.clearAllLocalStorage();
//     cy.clearAllCookies();
//     cy.window().then((win) => win.indexedDB.deleteDatabase('firebaseLocalStorageDb'));
//     cy.visit('/login');
//     cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
//     cy.get('input[type="password"]').type(Cypress.env('STUDENT_PASSWORD'));
//     cy.get('button[type="submit"]').click();
//     cy.url().should('include', '/dashboard');
//   }, { cacheAcrossSpecs: true });
//   cy.visit('/dashboard');
//   cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
// });

// Cypress.Commands.add('loginAsTeacher', () => {
//   cy.session(Cypress.env('TEACHER_EMAIL'), () => {
//     cy.clearAllLocalStorage();
//     cy.clearAllCookies();
//     cy.window().then((win) => win.indexedDB.deleteDatabase('firebaseLocalStorageDb'));
//     cy.visit('/login');
//     cy.get('input[type="email"]').type(Cypress.env('TEACHER_EMAIL'));
//     cy.get('input[type="password"]').type(Cypress.env('TEACHER_PASSWORD'));
//     cy.get('button[type="submit"]').click();
//     cy.url().should('include', '/dashboard');
//   }, { cacheAcrossSpecs: true });
//   cy.visit('/dashboard');
//   // 'Dataset Manager' only appears in teacher nav — confirms role is resolved
//   cy.get('#accordionSidebar', { timeout: 15000 }).should('contain', 'Dataset Manager');
// });

// // --- Navigation Helpers ---
// Cypress.Commands.add('navigateTo', (path) => {
//   cy.visit(`/dashboard/${path}`);
//   cy.url().should('include', `/dashboard/${path}`);
// });

// --- Intercept Groq API (AI) ---
Cypress.Commands.add('interceptAI', (statusCode = 200, body = {}) => {
  cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', {
    statusCode,
    body: statusCode === 200 ? {
      choices: [{ message: { content: body.content || 'Mocked AI response' } }]
    } : body,
  }).as('aiRequest');
});

Cypress.Commands.add('interceptAIRateLimit', () => {
  cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', {
    statusCode: 429,
    body: { error: { message: 'Rate limit exceeded' } },
  }).as('aiRateLimited');
});

// // --- Wait for page load ---
// Cypress.Commands.add('waitForDashboard', () => {
//   cy.url().should('include', '/dashboard');
//   cy.get('#accordionSidebar').should('be.visible');
// });

// --- Authentication Commands ---
Cypress.Commands.add('loginAsStudent', () => {
  const email = Cypress.env('STUDENT_EMAIL');
  const password = Cypress.env('STUDENT_PASSWORD');

  if (!email || !password) {
    throw new Error('Student credentials are missing in Cypress env');
  }

  cy.session('student-session', () => {
    // Clear Firebase IndexedDB since Cypress cy.session doesn't clear IndexedDB automatically
    // cy.window().then((win) => {
    //   if (win.indexedDB && typeof win.indexedDB.deleteDatabase === 'function') {
    //     win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
    //   }
    // });
    cy.window().then((win) => {
      if (win.indexedDB) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      }
    });

    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    
    // Ensure login completed before saving session
    cy.url().should('include', '/dashboard');
  }, { 
    cacheAcrossSpecs: true,
    validate() {
      // Validates that the session is still good by checking if we hit the dashboard
      cy.visit('/dashboard');
      cy.get('#accordionSidebar', { timeout: 10000 }).should('be.visible');
    }
  });

  // Ensure we are on the dashboard after session restoration
  cy.visit('/dashboard');
  cy.get('#accordionSidebar', { timeout: 15000 }).should('be.visible');
});

Cypress.Commands.add('loginAsTeacher', () => {
  cy.log(`EMAIL=${Cypress.env('TEACHER_EMAIL')}`);
  cy.log(`PASSWORD EXISTS=${!!Cypress.env('TEACHER_PASSWORD')}`);
  console.log('TEACHER_EMAIL=', Cypress.env('TEACHER_EMAIL'));
  console.log('TEACHER_PASSWORD exists=', !!Cypress.env('TEACHER_PASSWORD'));
  const email = Cypress.env('TEACHER_EMAIL');
  const password = Cypress.env('TEACHER_PASSWORD');

  if (!email || !password) {
    throw new Error('Teacher credentials are missing in Cypress env');
  }

  cy.session('teacher-session', () => {
    cy.window().then((win) => {
      // if (win.indexedDB && typeof win.indexedDB.deleteDatabase === 'function') {
      //   win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      // }
      if (win.indexedDB) {
        win.indexedDB.deleteDatabase('firebaseLocalStorageDb');
      }
    });

    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  }, { 
    cacheAcrossSpecs: true,
    validate() {
      cy.visit('/dashboard');
      cy.get('#accordionSidebar', { timeout: 10000 }).should('contain', 'Dataset Manager');
    }
  });

  cy.visit('/dashboard');
  cy.get('#accordionSidebar', { timeout: 15000 }).should('contain', 'Dataset Manager');
});

// --- Navigation Helpers ---
Cypress.Commands.add('navigateTo', (path) => {
  // Strips leading slash if provided to prevent '//dashboard//path' issues
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  cy.visit(`/dashboard/${cleanPath}`);
  cy.url().should('include', `/dashboard/${cleanPath}`);
});

// // --- Intercept Groq API (AI) ---
// Cypress.Commands.add('interceptAI', (statusCode = 200, body = {}) => {
//   cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', {
//     statusCode,
//     body: statusCode === 200 ? {
//       choices: [{ message: { content: body.content || 'Mocked AI response' } }]
//     } : body,
//   }).as('aiRequest'); // Keeping alias consistent
// });

// Cypress.Commands.add('interceptAIRateLimit', () => {
//   cy.intercept('POST', 'https://api.groq.com/openai/v1/chat/completions', {
//     statusCode: 429,
//     body: { error: { message: 'Rate limit exceeded' } },
//   }).as('aiRequest'); // Changed from aiRateLimited to keep consistent with interceptAI
// });

// --- Wait for page load ---
Cypress.Commands.add('waitForDashboard', () => {
  cy.url().should('include', '/dashboard');
  cy.get('#accordionSidebar').should('be.visible');
});
