describe('Football Manager Simulator - E2E Tests', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the main menu', () => {
    cy.get('[data-testid="main-menu"]').should('be.visible');
    cy.contains('New Career').should('be.visible');
    cy.contains('Load Game').should('be.visible');
    cy.contains('Settings').should('be.visible');
  });

  it('should show club selection screen when starting new career', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-selection"]').should('be.visible');
    cy.contains('Select a Club').should('be.visible');
  });

  it('should filter clubs by league', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-selection"]').should('be.visible');
    cy.get('[data-testid="league-filter"]').select('Premier League');
    cy.get('[data-testid="club-card"]').should('have.length.at.least', 1);
  });

  it('should display club details when club card is clicked', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.get('[data-testid="club-details"]').should('be.visible');
    cy.contains('Squad').should('be.visible');
  });

  it('should navigate to game HUD after selecting club', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.get('[data-testid="game-hud"]').should('be.visible');
    cy.contains('League Table').should('be.visible');
  });

  it('should display squad overview in HUD', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.get('[data-testid="squad-panel"]').should('be.visible');
    cy.get('[data-testid="player-row"]').should('have.length.at.least', 1);
  });

  it('should open settings panel', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Settings').click();
    cy.get('[data-testid="settings-panel"]').should('be.visible');
  });

  it('should navigate to match day interface', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Next Match').click();
    cy.get('[data-testid="match-day"]').should('be.visible');
    cy.contains('Commentary').should('be.visible');
  });

  it('should display live match stats during simulation', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Next Match').click();
    cy.get('[data-testid="match-stats"]').should('be.visible');
    cy.get('[data-testid="possession-stat"]').should('be.visible');
  });

  it('should show tactical overlay', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Next Match').click();
    cy.contains('Tactics').click();
    cy.get('[data-testid="tactical-overlay"]').should('be.visible');
  });

  it('should access save game functionality', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Save Game').click();
    cy.get('[data-testid="save-game-panel"]').should('be.visible');
    cy.get('[data-testid="save-slot"]').should('have.length', 10);
  });

  it('should load a saved game', () => {
    // First, create a save
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Save Game').click();
    cy.get('[data-testid="save-slot"]').first().click();
    cy.contains('Save').click();

    // Navigate back to main menu
    cy.contains('Main Menu').click();
    cy.contains('Load Game').click();
    cy.get('[data-testid="load-slot"]').first().should('contain', 'Career');
  });

  it('should display calendar with upcoming matches', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.get('[data-testid="calendar-panel"]').should('be.visible');
    cy.get('[data-testid="match-fixture"]').should('have.length.at.least', 1);
  });

  it('should display finances panel', () => {
    cy.contains('New Career').click();
    cy.get('[data-testid="club-card"]').first().click();
    cy.contains('Start Career').click();
    cy.contains('Finances').click();
    cy.get('[data-testid="finances-panel"]').should('be.visible');
    cy.contains('Budget').should('be.visible');
  });
});
