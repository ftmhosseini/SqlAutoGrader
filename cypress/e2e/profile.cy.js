describe('Profile Page', () => {
  context('as student', () => {
    beforeEach(() => {
      cy.loginAsStudent();
      cy.visit('/dashboard/profile');
    });

    it('loads profile page', () => {
      cy.url().should('include', '/dashboard/profile');
    });

    it('shows Profile heading', () => {
      cy.contains('Profile').should('be.visible');
    });

    it('shows email address label', () => {
      cy.contains('Email Address').should('be.visible');
    });

    it('shows Member Since label', () => {
      cy.contains('Member Since').should('be.visible');
    });

    it('shows role badge in uppercase', () => {
      cy.contains('STUDENT').should('be.visible');
    });
  });

  context('as teacher', () => {
    beforeEach(() => {
      cy.loginAsTeacher();
      cy.visit('/dashboard/profile');
    });

    it('shows TEACHER role badge', () => {
      cy.contains('TEACHER').should('be.visible');
    });
  });
});
