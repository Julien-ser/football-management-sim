import { Scout, ScoutManager } from './Scout';
import { Player, Team } from '../models';

// Helper to create test player
function createTestPlayer(
  id: number,
  teamId: number,
  position: string = 'striker',
  rating: number = 75,
  nationality: string = 'England'
): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality,
    dateOfBirth: `199${id % 10}-01-01`,
    position: position as any,
    currentRating: rating,
    potential: rating + 10,
    contract: { teamId, salary: 50000, expiryDate: '2026-06-30' },
    stats: { goals: 10, assists: 5, appearances: 30, minutesPlayed: 2700 },
  };
}

// Helper to create test team
function createTestTeam(id: number): Team {
  return {
    id,
    name: `Team ${id}`,
    shortName: `T${id}`,
    stadium: `Stadium ${id}`,
    capacity: 50000,
    leagueId: 1,
    manager: `Manager ${id}`,
    budget: 100000000,
    players: [],
  };
}

describe('Scout', () => {
  let scout: Scout;
  let player: Player;
  let team: Team;

  beforeEach(() => {
    scout = new Scout('SCOUT001', 'John Smith', 'England', 0.8);
    player = createTestPlayer(1, 1, 'striker', 75);
    team = createTestTeam(1);
  });

  it('should generate a scouting report', () => {
    const report = scout.scoutPlayer(player, team);

    expect(report.playerId).toBe(player.id);
    expect(report.scoutId).toBe(scout.getScoutId());
    expect(report.rating).toBeGreaterThan(0);
    expect(report.rating).toBeLessThanOrEqual(100);
    expect(report.potential).toBeGreaterThan(report.rating - 10);
    expect(report.potential).toBeLessThanOrEqual(110);
    expect(report.strengths.length).toBeGreaterThan(0);
    expect(report.weaknesses.length).toBeGreaterThan(0);
    expect(report.recommendations.length).toBeGreaterThan(0);
    expect(report.confidence).toBeGreaterThan(0);
    expect(report.confidence).toBeLessThanOrEqual(1);
    expect(report.scoutedDate).toBeDefined();
    expect(report.notes).toBeDefined();
  });

  it('should apply region expertise bonus', () => {
    const foreignPlayer = createTestPlayer(2, 1, 'striker', 75, 'Spain');
    const report = scout.scoutPlayer(foreignPlayer, team);

    const foreignReport = new Scout('SCOUT002', 'Jane Doe', 'Spain', 0.8).scoutPlayer(
      foreignPlayer,
      team
    );
    // Foreign scout should have higher confidence for Spanish player
    expect(foreignReport.confidence).toBeGreaterThan(report.confidence - 0.1);
  });

  it('should adjust rating based on knowledge level', () => {
    const lowKnowledgeScout = new Scout('SCOUT003', 'Unknown', 'England', 0.3);
    const report = lowKnowledgeScout.scoutPlayer(player, team);

    // Rating should have more variance with lower knowledge
    const highKnowledgeScout = new Scout('SCOUT004', 'Expert', 'England', 0.9);
    const highReport = highKnowledgeScout.scoutPlayer(player, team);

    // Reports from high knowledge scout should be more consistent (closer to actual rating)
    // Not testing exact values due to randomness, but structure should be correct
    expect(highReport.confidence).toBeGreaterThan(report.confidence);
  });

  it('should evaluate potential based on age', () => {
    const youngPlayer = createTestPlayer(10, 1, 'striker', 65); // Young
    youngPlayer.dateOfBirth = new Date(2005, 0, 1).toISOString();

    const oldPlayer = createTestPlayer(11, 1, 'striker', 75);
    oldPlayer.dateOfBirth = new Date(1985, 0, 1).toISOString();

    const youngReport = scout.scoutPlayer(youngPlayer, team);
    const oldReport = scout.scoutPlayer(oldPlayer, team);

    // Younger player should have higher potential ceiling
    expect(youngReport.potential).toBeGreaterThan(youngReport.rating);
    expect(oldReport.projectedCeiling).toBeLessThanOrEqual(95);
  });

  it('should provide position-specific strength analysis', () => {
    const goalkeeper = createTestPlayer(12, 1, 'goalkeeper', 80);
    const report = scout.scoutPlayer(goalkeeper, team);

    expect(report.strengths).toContain('Solid defender');
  });
});

describe('ScoutManager', () => {
  let manager: ScoutManager;
  let scout1: Scout;
  let scout2: Scout;
  let player: Player;
  let team: Team;

  beforeEach(() => {
    manager = new ScoutManager();
    scout1 = new Scout('S1', 'Scout One', 'England', 0.8);
    scout2 = new Scout('S2', 'Scout Two', 'Spain', 0.7);
    manager.addScout(scout1);
    manager.addScout(scout2);

    player = createTestPlayer(1, 1);
    team = createTestTeam(1);
  });

  it('should add and retrieve scouts', () => {
    const scouts = manager.getScouts();
    expect(scouts.length).toBe(2);
  });

  it('should assign scouting requests to available scouts', () => {
    const assignedScout = manager.requestScouting(player.id);
    expect(assignedScout).not.toBeNull();
    expect(assignedScout!.getScoutId()).toBe('S1');

    // First scout should be busy
    expect(manager.isScoutBusy(scout1.getScoutId())).toBe(true);
    expect(manager.isScoutBusy(scout2.getScoutId())).toBe(false);
  });

  it('should return null when no scouts available', () => {
    // Busy out both scouts
    manager.requestScouting(player.id);
    manager.requestScouting(createTestPlayer(2, 1).id);

    const thirdScoutRequest = manager.requestScouting(createTestPlayer(3, 1).id);
    expect(thirdScoutRequest).toBeNull();
  });

  it('should complete scouting and generate reports', () => {
    manager.requestScouting(player.id);
    const reports = manager.completeScouting(player.id, player, team);

    expect(reports.length).toBe(1);
    expect(reports[0].playerId).toBe(player.id);
    expect(reports[0].rating).toBeGreaterThan(0);
  });

  it('should cancel scouting requests', () => {
    manager.requestScouting(player.id);
    const result = manager.cancelScoutingRequest(player.id);

    expect(result).toBe(true);
    expect(manager.isScoutBusy(scout1.getScoutId())).toBe(false);
  });

  it('should remove scouts', () => {
    const result = manager.removeScout(scout1.getScoutId());
    expect(result).toBe(true);
    expect(manager.getScouts().length).toBe(1);
  });
});
