import './commands';

// Suppress uncaught exceptions from the app (Firebase auth, etc.)
Cypress.on('uncaught:exception', () => false);
