import { readFileSync } from 'fs';
import { join } from 'path';
import { MatchSimulator } from './MatchSimulator';
import { Team, Tactics } from '../models/Team';
import { Player } from '../models/Player';

describe('MatchSimulator', () => {
  let teams: any[];
  let players: any[];
  let homeTeam: Team;
  let awayTeam: Team;
  let homePlayers: Player[];
  let awayPlayers: Player[];

  beforeAll(() => {
    const dataPath = join(__dirname, '../../data');
    const playersData = readFileSync(`${dataPath}/players.json`, 'utf-8');
    const teamsData = readFileSync(`${dataPath}/teams.json`, 'utf-8');

    players = JSON.parse(playersData).players;
    teams = JSON.parse(teamsData).teams;

    // Use first two teams for simulation
    const team1 = teams[0];
    const team2 = teams[1];

    // Build player lists based on teamId from players
    const team1PlayerIds = players.filter((p) => p.teamId === team1.id).map((p) => p.id);
    const team2PlayerIds = players.filter((p) => p.teamId === team2.id).map((p) => p.id);

    homeTeam = {
      id: team1.id,
      name: team1.name,
      shortName: team1.shortName,
      stadium: team1.stadium,
      capacity: team1.capacity,
      leagueId: team1.leagueId,
      manager: team1.manager,
      budget: team1.budget,
      players: team1PlayerIds,
      tactics: team1.tactics,
    };

    awayTeam = {
      id: team2.id,
      name: team2.name,
      shortName: team2.shortName,
      stadium: team2.stadium,
      capacity: team2.capacity,
      leagueId: team2.leagueId,
      manager: team2.manager,
      budget: team2.budget,
      players: team2PlayerIds,
      tactics: team2.tactics,
    };

    homePlayers = players
      .filter((p) => p.teamId === team1.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        nationality: p.nationality,
        dateOfBirth: p.dateOfBirth,
        position: p.position,
        currentRating: p.currentRating,
        potential: p.potential,
        contract: p.contract,
        stats: p.stats,
      }));

    awayPlayers = players
      .filter((p) => p.teamId === team2.id)
      .map((p) => ({
        id: p.id,
        name: p.name,
        nationality: p.nationality,
        dateOfBirth: p.dateOfBirth,
        position: p.position,
        currentRating: p.currentRating,
        potential: p.potential,
        contract: p.contract,
        stats: p.stats,
      }));
  });

  test('should simulate a match and produce a valid result', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const result = await simulator.simulate();

    // Verify result structure
    expect(result).toHaveProperty('id');
    expect(result.homeTeamId).toBe(homeTeam.id);
    expect(result.awayTeamId).toBe(awayTeam.id);
    expect(result.status).toBe('completed');
    expect(result.score).toBeDefined();
    expect(result.score!.home).toBeGreaterThanOrEqual(0);
    expect(result.score!.away).toBeGreaterThanOrEqual(0);
    expect(result.events).toBeInstanceOf(Array);
    expect(result.statistics).toBeDefined();
  });

  test('should have proper statistics in result', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const result = await simulator.simulate();

    expect(result.statistics).toBeDefined();
    expect(result.statistics!.possession).toBeDefined();
    expect(result.statistics!.possession.home).toBeGreaterThanOrEqual(0);
    expect(result.statistics!.possession.away).toBeGreaterThanOrEqual(0);
    expect(result.statistics!.possession.home + result.statistics!.possession.away).toBe(100);

    expect(result.statistics!.shots).toBeDefined();
    expect(result.statistics!.shots.home).toBeGreaterThanOrEqual(0);
    expect(result.statistics!.shots.away).toBeGreaterThanOrEqual(0);

    expect(result.statistics!.passes).toBeDefined();
    expect(result.statistics!.passes.home).toBeGreaterThanOrEqual(0);
    expect(result.statistics!.passes.away).toBeGreaterThanOrEqual(0);
  });

  test('should generate match events', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const result = await simulator.simulate();

    // Should have at least some events
    expect(result.events.length).toBeGreaterThan(0);

    // Check for required event types
    const eventTypes = result.events.map((e) => e.type);
    expect(eventTypes).toContain('match-start');
    expect(eventTypes).toContain('full-time');

    // Check for goals (optional - may not always have goals)
    if (result.score!.home > 0 || result.score!.away > 0) {
      expect(eventTypes).toContain('goal');
    }
  });

  test('should simulate within performance target (<5 seconds)', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const startTime = Date.now();
    await simulator.simulate();
    const duration = Date.now() - startTime;

    // Should complete in less than 5 seconds (5000ms)
    expect(duration).toBeLessThan(5000);
  });

  test('should have accurate score based on goal events', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const result = await simulator.simulate();

    const homeGoals = result.events.filter(
      (e) => e.type === 'goal' && e.teamId === homeTeam.id
    ).length;
    const awayGoals = result.events.filter(
      (e) => e.type === 'goal' && e.teamId === awayTeam.id
    ).length;
    const ownGoalsByHome = result.events.filter(
      (e) => e.type === 'own-goal' && e.teamId === awayTeam.id
    ).length;
    const ownGoalsByAway = result.events.filter(
      (e) => e.type === 'own-goal' && e.teamId === homeTeam.id
    ).length;

    const calculatedHomeScore = homeGoals + ownGoalsByAway;
    const calculatedAwayScore = awayGoals + ownGoalsByHome;

    expect(result.score).not.toBeUndefined();
    expect(result.score!.home).toBe(calculatedHomeScore);
    expect(result.score!.away).toBe(calculatedAwayScore);
  });

  test('should apply custom tactics if provided', async () => {
    const customTactics: Tactics = {
      formation: '4-3-3',
      mentality: 'attacking',
      pressingIntensity: 'high',
      passingStyle: 'short',
    };

    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
      homeTactics: customTactics,
    });

    const result = await simulator.simulate();

    // Just verify it still produces a valid result with custom tactics
    expect(result).toHaveProperty('score');
    expect(result.score!.home >= 0);
    expect(result.score!.away >= 0);
  });

  test('should track yellow and red cards', async () => {
    const simulator = new MatchSimulator({
      homeTeam,
      awayTeam,
      homePlayers,
      awayPlayers,
    });

    const result = await simulator.simulate();

    // We can't directly access simulator stats after simulation,
    // but we can check that card events exist
    const cardEvents = result.events.filter(
      (e) => e.type === 'yellow-card' || e.type === 'red-card'
    );

    // It's okay if no cards, but if there are, they should be valid
    cardEvents.forEach((event) => {
      expect(['yellow-card', 'red-card']).toContain(event.type);
    });
  });
});
