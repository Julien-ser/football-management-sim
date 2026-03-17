import { readFileSync } from 'fs';
import { join } from 'path';

describe('Data Models', () => {
  let players: any[];
  let teams: any[];
  let competitions: any[];

  beforeAll(() => {
    const dataPath = join(__dirname, '../data');
    const playersData = readFileSync(`${dataPath}/players.json`, 'utf-8');
    const teamsData = readFileSync(`${dataPath}/teams.json`, 'utf-8');
    const compsData = readFileSync(`${dataPath}/competitions.json`, 'utf-8');

    players = JSON.parse(playersData).players;
    const rawTeams = JSON.parse(teamsData).teams;
    competitions = JSON.parse(compsData).competitions;

    // Enrich teams with players array based on player.teamId
    teams = rawTeams.map((team: any) => ({
      ...team,
      players: players.filter((p) => p.teamId === team.id).map((p) => p.id),
    }));
  });

  test('should have 100 players', () => {
    expect(players.length).toBeGreaterThanOrEqual(100);
  });

  test('should have 10 teams', () => {
    expect(teams.length).toBe(10);
  });

  test('should have 5 competitions', () => {
    expect(competitions.length).toBe(5);
  });

  test('each player should have required fields', () => {
    players.forEach((player) => {
      expect(player).toHaveProperty('id');
      expect(player).toHaveProperty('teamId');
      expect(player).toHaveProperty('name');
      expect(player).toHaveProperty('nationality');
      expect(player).toHaveProperty('dateOfBirth');
      expect(player).toHaveProperty('position');
      expect(player).toHaveProperty('currentRating');
      expect(player).toHaveProperty('potential');
      expect(player).toHaveProperty('contract');
      expect(player).toHaveProperty('stats');
    });
  });

  test('each team should have required fields', () => {
    teams.forEach((team) => {
      expect(team).toHaveProperty('id');
      expect(team).toHaveProperty('name');
      expect(team).toHaveProperty('shortName');
      expect(team).toHaveProperty('stadium');
      expect(team).toHaveProperty('capacity');
      expect(team).toHaveProperty('leagueId');
      expect(team).toHaveProperty('manager');
      expect(team).toHaveProperty('budget');
      expect(team).toHaveProperty('players');
    });
  });

  test('player ratings should be between 0 and 100', () => {
    players.forEach((player) => {
      expect(player.currentRating).toBeGreaterThanOrEqual(0);
      expect(player.currentRating).toBeLessThanOrEqual(100);
      expect(player.potential).toBeGreaterThanOrEqual(0);
      expect(player.potential).toBeLessThanOrEqual(100);
    });
  });

  test('teams should have players assigned', () => {
    teams.forEach((team) => {
      expect(team.players.length).toBeGreaterThan(0);
    });
  });

  test('player positions should be valid', () => {
    const validPositions = [
      'goalkeeper',
      'right-back',
      'left-back',
      'center-back',
      'defensive-midfielder',
      'central-midfielder',
      'attacking-midfielder',
      'right-winger',
      'left-winger',
      'striker',
    ];
    players.forEach((player) => {
      expect(validPositions).toContain(player.position);
    });
  });

  test('player contracts should have salary and expiry', () => {
    players.forEach((player) => {
      expect(player.contract).toHaveProperty('salary');
      expect(player.contract).toHaveProperty('expiryDate');
    });
  });

  test('competitions should reference valid teams', () => {
    const teamIds = teams.map((t) => t.id);
    competitions.forEach((comp) => {
      comp.teams.forEach((teamId: number) => {
        expect(teamIds).toContain(teamId);
      });
    });
  });

  test('each team should have at least 10 players', () => {
    teams.forEach((team) => {
      expect(team.players.length).toBeGreaterThanOrEqual(10);
    });
  });
});
