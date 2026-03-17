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

describe('TransferManager', () => {
  let manager: TransferManager;
  let players: Player[];
  let teams: Team[];
  let competitions: Competition[];

  beforeEach(() => {
    teams = [createTestTeam(1, 150000000), createTestTeam(2, 100000000)];
    competitions = [createTestCompetition(1, 'league'), createTestCompetition(2, 'cup')];

    players = [
      // Team 1 players
      createTestPlayer(1, 1, 'striker', 80),
      createTestPlayer(2, 1, 'goalkeeper', 75),
      createTestPlayer(5, 1, 'goalkeeper', 72), // second GK
      createTestPlayer(6, 1, 'center-back', 73),
      createTestPlayer(7, 1, 'center-back', 72),
      createTestPlayer(8, 1, 'right-back', 71),
      createTestPlayer(9, 1, 'defensive-midfielder', 74),
      createTestPlayer(10, 1, 'central-midfielder', 75),
      createTestPlayer(11, 1, 'attacking-midfielder', 76),
      createTestPlayer(12, 1, 'right-winger', 77), // forward
      // Team 2 players
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
      const bid = manager.placeBid(1, 2, 50000000); // Bid equal to asking price
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

  describe('Edge cases and error handling', () => {
    it('should handle performAIActivity when no AI initialized', async () => {
      const reports = await manager.performAIActivity();
      expect(reports.size).toBe(0);
    });

    it('should handle performAIActivity for teams without AI', async () => {
      // Initialize AI only for team 1
      manager.initializeAI([1]);
      // Request activity for team 2 (no AI)
      const reports = await manager.performAIActivity([2]);
      expect(reports.size).toBe(0);
    });

    it('should return false for withdrawListing non-existent player', () => {
      expect(manager.withdrawListing(999)).toBe(false);
    });

    it('should return false for completeTransfer with non-existent bid', () => {
      expect(manager.completeTransfer('nonexistent')).toBe(false);
    });

    it('should return false for completeTransfer when contract negotiation fails', () => {
      manager.listPlayer(1, 50000000);
      const bid = manager.placeBid(1, 2, 48000000);
      manager.acceptBid(bid!.id);

      const negotiator = (manager as any).negotiator;
      const spy = jest.spyOn(negotiator, 'negotiateContract').mockReturnValue({ accepted: false });

      expect(manager.completeTransfer(bid!.id)).toBe(false);

      spy.mockRestore();
    });

    it('should reject invalid bid', () => {
      expect(manager.rejectBid('invalid')).toBe(false);
    });

    it('should return null for counterBid with invalid bid', () => {
      expect(manager.counterBid('invalid', 50000000)).toBeNull();
    });

    it('should evaluate bid and return not meetMinimum for invalid bid', () => {
      const evaluation = manager.evaluateBid('invalid');
      expect(evaluation.meetsMinimum).toBe(false);
      expect(evaluation.feedback).toBe('Bid not found');
    });

    it('should return null for generateCounterOffer with invalid bid', () => {
      expect(manager.generateCounterOffer('invalid')).toBeNull();
    });

    it('should assess transfer viability with non-existent player', () => {
      const contract = {
        salary: 50000,
        contractLength: 3,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 3, 11, 31).toISOString(),
      };
      const assessment = manager.assessTransferViability(999, 1000000, contract, 1);
      expect(assessment.viable).toBe(false);
      expect(assessment.reason).toBe('Player or team not found');
    });

    it('should assess transfer viability with non-existent team', () => {
      const player = manager.getPlayers()[0];
      const contract = {
        salary: 50000,
        contractLength: 3,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 3, 11, 31).toISOString(),
      };
      const assessment = manager.assessTransferViability(player!.id, 1000000, contract, 999);
      expect(assessment.viable).toBe(false);
      expect(assessment.reason).toBe('Player or team not found');
    });

    it('should return empty array for getBidsForPlayer when no bids', () => {
      expect(manager.getBidsForPlayer(1)).toEqual([]);
    });

    it('should return empty array for getBuyerBids when no bids', () => {
      expect(manager.getBuyerBids(1)).toEqual([]);
    });

    it('should return empty array for getSellerBids when no bids', () => {
      expect(manager.getSellerBids(1)).toEqual([]);
    });

    it('should return null for getPlayerWithListing for non-listed player', () => {
      expect(manager.getPlayerWithListing(999)).toBeNull();
    });

    it('should reinitialize AI after updateData', () => {
      const newPlayers = [createTestPlayer(10, 1), createTestPlayer(11, 2)];
      const newTeams = [createTestTeam(10), createTestTeam(11)];
      manager.updateData(newPlayers, newTeams, competitions);
      // Verify AI map contains entries for new teams
      expect((manager as any).transferAIs.has(10)).toBe(true);
      expect((manager as any).transferAIs.has(11)).toBe(true);
    });
  });

  describe('Additional missing edge cases', () => {
    it('should return false for listPlayer with non-existent player', () => {
      const result = manager.listPlayer(999, 50000000);
      expect(result).toBe(false);
    });

    it('should return false for listPlayer when player has invalid team', () => {
      const badPlayer: Player = {
        ...createTestPlayer(100, 1),
        contract: { ...createTestPlayer(100, 1).contract, teamId: 999 },
      };
      const badList = [...players, badPlayer];
      manager.updateData(badList, teams, competitions);
      const result = manager.listPlayer(100, 50000000);
      expect(result).toBe(false);
    });

    it('should return false for withdrawListing when listing exists but status is withdrawn', () => {
      manager.listPlayer(1, 50000000);
      manager.withdrawListing(1);
      const result = manager.withdrawListing(1);
      expect(result).toBe(false);
    });

    it('should return null for placeBid with insufficient buyer budget', () => {
      manager.listPlayer(1, 50000000);
      const result = manager.placeBid(1, 2, 200000000);
      expect(result).toBeNull();
    });

    it('should return null for placeBid with non-existent listing', () => {
      const result = manager.placeBid(999, 2, 50000000);
      expect(result).toBeNull();
    });

    it('should return null for placeBid when buyer team does not exist', () => {
      manager.listPlayer(1, 50000000);
      const result = manager.placeBid(1, 999, 50000000);
      expect(result).toBeNull();
    });

    it('should return null for placeBid when listing is not available', () => {
      manager.listPlayer(1, 50000000);
      manager.withdrawListing(1);
      const result = manager.placeBid(1, 2, 50000000);
      expect(result).toBeNull();
    });

    it('should filter team registrations by season', () => {
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
      manager.registerSquad(1, 2, '2024-2025', playerIds, slots);

      const all = manager.getTeamRegistrations(1);
      const filtered = manager.getTeamRegistrations(1, '2025-2026');

      expect(all.length).toBe(2);
      expect(filtered.length).toBe(1);
      expect(filtered[0].season).toBe('2025-2026');
    });
  });
});
