const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1280,
    viewportHeight: 720,
    supportFile: 'cypress/support/e2e.js',
    defaultCommandTimeout: 10000,
    video: true,
    screenshotOnRunFailure: true,
    retries: { runMode: 1, openMode: 0 },
    env: {
      STUDENT_EMAIL: process.env.CYPRESS_STUDENT_EMAIL,
      STUDENT_PASSWORD: process.env.CYPRESS_STUDENT_PASSWORD,
      TEACHER_EMAIL: process.env.CYPRESS_TEACHER_EMAIL,
      TEACHER_PASSWORD: process.env.CYPRESS_TEACHER_PASSWORD,
    },
  },
});

