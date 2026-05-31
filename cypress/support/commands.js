// --- Authentication Commands ---
Cypress.Commands.add('loginAsStudent', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(Cypress.env('STUDENT_EMAIL'));
  cy.get('input[type="password"]').type(Cypress.env('STUDENT_PASSWORD'));
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

Cypress.Commands.add('loginAsTeacher', () => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(Cypress.env('TEACHER_EMAIL'));
  cy.get('input[type="password"]').type(Cypress.env('TEACHER_PASSWORD'));
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// --- Navigation Helpers ---
Cypress.Commands.add('navigateTo', (path) => {
  cy.visit(`/dashboard/${path}`);
  cy.url().should('include', `/dashboard/${path}`);
});

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

// --- Wait for page load ---
Cypress.Commands.add('waitForDashboard', () => {
  cy.url().should('include', '/dashboard');
  cy.get('#accordionSidebar').should('be.visible');
});
