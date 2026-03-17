import { TransferManager } from './TransferManager';
import { Player, Team, Competition } from '../models';

// Helper to create test player
function createTestPlayer(
  id: number,
  teamId: number,
  position: string = 'striker',
  rating: number = 75
): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    dateOfBirth: '1995-01-01',
    position: position as any,
    currentRating: rating,
    potential: rating + 10,
    contract: { teamId, salary: 50000, expiryDate: '2026-06-30' },
    stats: { goals: 10, assists: 5, appearances: 30, minutesPlayed: 2700 },
  };
}

// Helper to create test team
function createTestTeam(id: number, budget: number = 100000000): Team {
  return {
    id,
    name: `Team ${id}`,
    shortName: `T${id}`,
    stadium: `Stadium ${id}`,
    capacity: 50000,
    leagueId: 1,
    manager: `Manager ${id}`,
    budget,
    players: [],
  };
}

// Helper to create test competition
function createTestCompetition(id: number, type: 'league' | 'cup' = 'league'): Competition {
  return {
    id,
    name: `Competition ${id}`,
    type,
    country: 'England',
    teams: [],
    season: '2025-2026',
    currentMatchday: 1,
  };
}

describe('TransferManager', () => {
  let manager: TransferManager;
  let players: Player[];
  let teams: Team[];
  let competitions: Competition[];

  beforeEach(() => {
    teams = [createTestTeam(1, 150000000), createTestTeam(2, 100000000)];
    competitions = [createTestCompetition(1, 'league')];

    players = [
      createTestPlayer(1, 1, 'striker', 80),
      createTestPlayer(2, 1, 'goalkeeper', 75),
      createTestPlayer(3, 2, 'defender', 70),
      createTestPlayer(4, 2, 'midfielder', 82),
    ];

    // Initialize team players arrays
    teams.forEach((team) => {
      team.players = players.filter((p) => p.contract.teamId === team.id).map((p) => p.id);
    });

    manager = new TransferManager(players, teams, competitions);
  });

  describe('listPlayer and getListings', () => {
    it('should list a player and retrieve it', () => {
      const result = manager.listPlayer(1, 50000000);
      expect(result).toBe(true);

      const withListing = manager.getPlayerWithListing(1);
      expect(withListing).not.toBeNull();
      expect(withListing!.listing.askingPrice).toBe(50000000);
    });

    it('should search listings with filters', () => {
      manager.listPlayer(1, 50000000);
      manager.listPlayer(2, 30000000);

      const strikers = manager.searchListings({ positions: ['striker'] });
      expect(strikers.length).toBe(1);
      expect(strikers[0].id).toBe(1);
    });

    it('should get market summary', () => {
      manager.listPlayer(1, 50000000);
      manager.listPlayer(2, 30000000);

      const summary = manager.getMarketSummary();
      expect(summary.totalPlayers).toBe(2);
      expect(summary.avgRating).toBeCloseTo(77.5, 1);
    });
  });

  describe('placeBid and evaluateBid', () => {
    beforeEach(() => {
      manager.listPlayer(1, 50000000);
    });

    it('should place a bid', () => {
      const bid = manager.placeBid(1, 2, 45000000);
      expect(bid).not.toBeNull();
      expect(bid!.status).toBe('pending');
    });

    it('should evaluate a bid', () => {
      const bid = manager.placeBid(1, 2, 45000000);
      const evaluation = manager.evaluateBid(bid!.id);

      expect(evaluation.meetsMinimum).toBe(true);
    });

    it('should generate counter offer', () => {
      const bid = manager.placeBid(1, 2, 40000000);
      const counter = manager.generateCounterOffer(bid!.id, 'aggressive');

      expect(counter).not.toBeNull();
      expect(counter).toBeGreaterThan(40000000);
    });
  });

  describe('completeTransfer with negotiation', () => {
    let bidId: string;

    beforeEach(() => {
      manager.listPlayer(1, 50000000);
      const bid = manager.placeBid(1, 2, 48000000);
      bidId = bid!.id;
      manager.acceptBid(bidId);
    });

    it('should complete transfer and negotiate contract if none provided', () => {
      const result = manager.completeTransfer(bidId);
      expect(result).toBe(true);

      // Verify player transferred
      const player = manager.getPlayer(1);
      expect(player!.contract.teamId).toBe(2);

      // Verify team players updated
      const buyerTeam = manager.getTeam(2);
      const sellerTeam = manager.getTeam(1);
      expect(buyerTeam!.players).toContain(1);
      expect(sellerTeam!.players).not.toContain(1);
    });

    it('should complete transfer with specified contract', () => {
      const result = manager.completeTransfer(bidId, {
        salary: 100000,
        contractLength: 5,
      });

      expect(result).toBe(true);
      const player = manager.getPlayer(1);
      expect(player!.contract.salary).toBe(100000);
    });
  });

  describe('squad registration', () => {
    it('should register a valid squad for cup competition', () => {
      // Use all team1 players which meet cup requirements (2 GK, 3 Def, 3 Mid, 3 Fwd)
      const team1Players = manager.getPlayers().filter((p) => p.contract.teamId === 1);
      const playerIds = team1Players.map((p) => p.id);
      const slots = team1Players.map((p, idx) => ({
        playerId: p.id,
        position: p.position,
        jerseyNumber: idx + 1,
        isCaptain: idx === 0,
        isViceCaptain: idx === 1,
      }));

      const result = manager.registerSquad(1, 2, '2025-2026', playerIds, slots);
      expect(result).not.toBeNull();
      expect(result!.players.length).toBe(playerIds.length);
    });

    it('should check player registration status', () => {
      // Register a squad first
      const team1Players = manager.getPlayers().filter((p) => p.contract.teamId === 1);
      const playerIds = team1Players.map((p) => p.id);
      const slots = team1Players.map((p, idx) => ({
        playerId: p.id,
        position: p.position,
        jerseyNumber: idx + 1,
        isCaptain: idx === 0,
        isViceCaptain: false,
      }));
      manager.registerSquad(1, 2, '2025-2026', playerIds, slots);

      // Check registered players
      expect(manager.isPlayerRegistered(team1Players[0].id, 1, 2, '2025-2026')).toBe(true);
      // Non-existent player
      expect(manager.isPlayerRegistered(999, 1, 2, '2025-2026')).toBe(false);
    });

    it('should get team registrations', () => {
      const team1Players = manager.getPlayers().filter((p) => p.contract.teamId === 1);
      const playerIds = team1Players.map((p) => p.id);
      const slots = team1Players.map((p, idx) => ({
        playerId: p.id,
        position: p.position,
        jerseyNumber: idx + 1,
        isCaptain: idx === 0,
        isViceCaptain: false,
      }));
      manager.registerSquad(1, 2, '2025-2026', playerIds, slots);

      const registrations = manager.getTeamRegistrations(1);
      expect(registrations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('data updates', () => {
    it('should update data references', () => {
      const newPlayers = [createTestPlayer(10, 1), createTestPlayer(11, 2)];
      const newTeams = [createTestTeam(10), createTestTeam(11)];

      manager.updateData(newPlayers, newTeams, competitions);

      expect(manager.getPlayer(10)).not.toBeUndefined();
      expect(manager.getTeam(10)).not.toBeUndefined();
    });
  });

  describe('budget management', () => {
    it('should assess transfer viability', () => {
      const assessment = manager.assessTransferViability(
        manager.getPlayer(1)!.id,
        40000000,
        {
          salary: 80000,
          contractLength: 4,
          startDate: new Date().toISOString(),
          expiryDate: new Date(new Date().getFullYear() + 4, 11, 31).toISOString(),
        },
        2
      );

      expect(assessment).toHaveProperty('viable');
      expect(assessment).toHaveProperty('reason');
      expect(assessment).toHaveProperty('projectedCost');
    });
  });
});
