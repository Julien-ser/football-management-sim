import { SquadRegistrationManager } from './SquadRegistration';
import { Player, Team, Competition } from '../models';
import { SquadSlot } from './types';

// Helper to create test player
function createTestPlayer(id: number, teamId: number, position: string = 'striker'): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    dateOfBirth: '1995-01-01',
    position: position as any,
    currentRating: 75,
    potential: 80,
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

// Helper to create test competition
function createTestCompetition(
  id: number,
  type: 'league' | 'cup' | 'champions-league' = 'league'
): Competition {
  return {
    id,
    name: `Competition ${id}`,
    type,
    country: 'England',
    teams: [],
    season: '2025-26',
    currentMatchday: 1,
    format: type === 'league' ? 'round_robin' : 'single_elimination',
    stages: [],
    matches: [],
    rules: {
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      qualificationSpots: [],
      relegationSpots: 0,
      promotionSpots: undefined,
      tiebreakers: [],
      aggregateLegs: 2,
      awayGoalsRule: false,
      extraTime: true,
      penalties: true,
    },
    seasonStartDate: '2025-08-01',
    seasonEndDate: '2026-05-31',
    currentStage: 'group_stage',
  };
}

describe('SquadRegistrationManager', () => {
  let manager: SquadRegistrationManager;
  let players: Player[];
  let teams: Team[];
  let competitions: Competition[];

  beforeEach(() => {
    teams = [createTestTeam(1), createTestTeam(2)];
    competitions = [createTestCompetition(1, 'league'), createTestCompetition(2, 'cup')];

    // Extended player pool with enough players to meet competition minimums
    players = [
      createTestPlayer(1, 1, 'goalkeeper'),
      createTestPlayer(2, 1, 'center-back'),
      createTestPlayer(3, 1, 'center-back'),
      createTestPlayer(4, 1, 'right-back'),
      createTestPlayer(5, 1, 'left-back'),
      createTestPlayer(6, 1, 'defensive-midfielder'),
      createTestPlayer(7, 1, 'central-midfielder'),
      createTestPlayer(8, 1, 'attacking-midfielder'),
      createTestPlayer(9, 1, 'right-winger'),
      createTestPlayer(10, 1, 'left-winger'),
      createTestPlayer(11, 1, 'striker'),
      createTestPlayer(12, 1, 'central-midfielder'), // extra midfielder instead of striker
      createTestPlayer(13, 1, 'goalkeeper'),
      createTestPlayer(14, 1, 'center-back'),
      createTestPlayer(15, 1, 'central-midfielder'),
      createTestPlayer(16, 1, 'striker'), // extra forward for surplus
      createTestPlayer(17, 1, 'left-back'),
      createTestPlayer(18, 1, 'defensive-midfielder'),
    ];

    // Initialize team players
    teams.forEach((team) => {
      team.players = players.filter((p) => p.contract.teamId === team.id).map((p) => p.id);
    });

    manager = new SquadRegistrationManager(players, teams, competitions);
  });

  describe('validateSquad', () => {
    it('should validate a compliant squad', () => {
      const rules = manager['getCompetitionRules']('league');
      const playerIds = players.slice(0, 15).map((p) => p.id);
      const slots: any[] = [];

      const result = manager['validateSquad'](playerIds, slots, rules, 1, 1);
      expect(result.valid).toBe(true);
      expect(result.errors.length).toBe(0);
    });

    it('should reject squad exceeding max players', () => {
      const rules = manager['getCompetitionRules']('league');
      const allPlayers = Array.from({ length: 26 }, (_, i) => i + 1);
      const slots: any[] = [];

      const result = manager['validateSquad'](allPlayers, slots, rules, 1, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('exceeds maximum'))).toBe(true);
    });

    it('should reject insufficient goalkeepers', () => {
      const rules = manager['getCompetitionRules']('league');
      const playerIds = players.filter((p) => p.position !== 'goalkeeper').map((p) => p.id);
      const slots: any[] = [];

      const result = manager['validateSquad'](playerIds, slots, rules, 1, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('goalkeepers'))).toBe(true);
    });

    it('should reject duplicate jersey numbers', () => {
      const rules = manager['getCompetitionRules']('league');
      const playerIds = players.slice(0, 11).map((p) => p.id);
      const slots: any[] = [
        {
          playerId: 1,
          position: 'goalkeeper',
          jerseyNumber: 1,
          isCaptain: false,
          isViceCaptain: false,
        },
        {
          playerId: 2,
          position: 'center-back',
          jerseyNumber: 1,
          isCaptain: false,
          isViceCaptain: false,
        }, // Duplicate
      ];

      const result = manager['validateSquad'](playerIds, slots, rules, 1, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Duplicate jersey number'))).toBe(true);
    });

    it('should reject multiple captains', () => {
      const rules = manager['getCompetitionRules']('league');
      const playerIds = players.slice(0, 11).map((p) => p.id);
      const slots: any[] = [
        {
          playerId: 1,
          position: 'goalkeeper',
          jerseyNumber: 1,
          isCaptain: true,
          isViceCaptain: false,
        },
        {
          playerId: 2,
          position: 'center-back',
          jerseyNumber: 2,
          isCaptain: true,
          isViceCaptain: false,
        }, // Two captains
      ];

      const result = manager['validateSquad'](playerIds, slots, rules, 1, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('Multiple captains'))).toBe(true);
    });

    it('should reject players not belonging to team', () => {
      const rules = manager['getCompetitionRules']('league');
      const playerIds = [1, 2, 999]; // 999 not in team
      const slots: any[] = [];

      const result = manager['validateSquad'](playerIds, slots, rules, 1, 1);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.includes('not in team'))).toBe(true);
    });
  });

  describe('registerSquad', () => {
    it('should register a valid squad', () => {
      const playerIds = players.slice(0, 15).map((p) => p.id);
      const slots = players.slice(0, 15).map((p) => ({
        playerId: p.id,
        position: p.position,
        jerseyNumber: p.id,
        isCaptain: p.id === 1,
        isViceCaptain: p.id === 2,
      }));

      const result = manager.registerSquad(1, 1, '2025-2026', playerIds, slots);

      expect(result).not.toBeNull();
      expect(result!.competitionId).toBe(1);
      expect(result!.teamId).toBe(1);
      expect(result!.players.length).toBe(15);
      expect(result!.maxPlayers).toBe(25);
    });

    it('should fail to register invalid squad', () => {
      const playerIds = [1]; // Only 1 player
      const slots: SquadSlot[] = [];

      const result = manager.registerSquad(1, 1, '2025-2026', playerIds, slots);
      expect(result).toBeNull();
    });

    it('should check position minimums for different competition types', () => {
      const playerIds = players.slice(0, 5).map((p) => p.id); // Only 5 players
      const slots = playerIds.map((id, idx) => {
        const player = players.find((p) => p.id === id)!;
        return {
          playerId: id,
          position: player.position,
          jerseyNumber: idx + 1,
          isCaptain: idx === 0,
          isViceCaptain: false,
        };
      });

      const result = manager.registerSquad(1, 2, '2025-26', playerIds, slots); // Cup competition
      expect(result).toBeNull();
    });
  });

  describe('addPlayersToSquad and removePlayersFromSquad', () => {
    let registration: any;

    beforeEach(() => {
      // Register a valid squad with 16 players (includes a surplus forward)
      const playerIds = players.slice(0, 16).map((p) => p.id);
      const slots = players.slice(0, 16).map((p) => ({
        playerId: p.id,
        position: p.position,
        jerseyNumber: p.id,
        isCaptain: p.id === 1,
        isViceCaptain: p.id === 2,
      }));

      registration = manager.registerSquad(1, 1, '2025-26', playerIds, slots);
    });

    it('should add players to existing squad', () => {
      // Players beyond the initial 16 are not in the squad
      const newPlayers = [players[16].id, players[17].id];
      const result = manager.addPlayersToSquad(1, 1, '2025-26', newPlayers);

      expect(result).toBe(true);
      const updated = manager.getRegistration(1, 1, '2025-26');
      expect(updated!.players.length).toBe(18);
    });

    it('should remove players from squad', () => {
      // Remove the surplus forward (player 16 at index 15)
      const toRemove = [players[15].id];
      const result = manager.removePlayersFromSquad(1, 1, '2025-26', toRemove);

      expect(result).toBe(true);
      const updated = manager.getRegistration(1, 1, '2025-26');
      expect(updated!.players.length).toBe(15);
      expect(updated!.players).not.toContain(players[15].id);
    });

    it('should not allow removal that violates minimums', () => {
      // Start with exactly minimal squad (15 players)
      const minimalSquad = players.slice(0, 15).map((p) => p.id);
      manager.registerSquad(1, 1, '2025-2026', minimalSquad, []);

      // Try to remove a goalkeeper
      const result = manager.removePlayersFromSquad(1, 1, '2025-2026', [players[0].id]);
      expect(result).toBe(false);
    });
  });

  describe('isPlayerRegistered', () => {
    beforeEach(() => {
      const playerIds = players.slice(0, 15).map((p) => p.id);
      manager.registerSquad(1, 1, '2025-26', playerIds, []);
    });

    it('should return true for registered player', () => {
      expect(manager.isPlayerRegistered(1, 1, 1, '2025-26')).toBe(true);
    });

    it('should return false for unregistered player', () => {
      expect(manager.isPlayerRegistered(999, 1, 1, '2025-26')).toBe(false);
    });

    it('should return false for unregistered competition', () => {
      expect(manager.isPlayerRegistered(1, 1, 999, '2025-26')).toBe(false);
    });
  });

  describe('getTeamRegistrations and getCompetitionRegistrations', () => {
    beforeEach(() => {
      const playerIds1 = players.slice(0, 15).map((p) => p.id);
      const playerIds2 = players.slice(0, 13).map((p) => p.id);

      manager.registerSquad(1, 1, '2025-26', playerIds1, []);
      manager.registerSquad(1, 2, '2025-26', playerIds2, []);
    });

    it('should get all registrations for a team', () => {
      const registrations = manager.getTeamRegistrations(1);
      expect(registrations.length).toBe(2);
    });

    it('should filter team registrations by season', () => {
      const registrations = manager.getTeamRegistrations(1, '2024-25');
      expect(registrations.length).toBe(0);
    });

    it('should get all registrations for a competition', () => {
      const registrations = manager.getCompetitionRegistrations(1);
      expect(registrations.length).toBe(1);
      expect(registrations[0].teamId).toBe(1);
    });
  });
});
