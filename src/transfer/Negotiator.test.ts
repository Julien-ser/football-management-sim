import { Negotiator } from './Negotiator';
import { Player, Team } from '../models';

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

describe('Negotiator', () => {
  let negotiator: Negotiator;
  let player: Player;
  let team: Team;

  beforeEach(() => {
    negotiator = new Negotiator();
    player = createTestPlayer(1, 1, 'striker', 80);
    team = createTestTeam(1);
  });

  describe('evaluateBid', () => {
    const listing = { askingPrice: 50000000, minimumFee: 45000000 };

    it('should accept bid meeting asking price', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 50000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const result = negotiator.evaluateBid(bid, listing, player);
      expect(result.meetsMinimum).toBe(true);
      expect(result.feedback).toBe('Bid meets requirements');
    });

    it('should reject bid below asking price', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 40000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const result = negotiator.evaluateBid(bid, listing, player);
      expect(result.meetsMinimum).toBe(false);
      expect(result.feedback).toContain('below asking price');
    });

    it('should respect minimum fee', () => {
      const listingWithMin = { askingPrice: 60000000, minimumFee: 50000000 };
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 55000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const result = negotiator.evaluateBid(bid, listingWithMin, player);
      expect(result.meetsMinimum).toBe(true); // Meets minimum but not asking
    });

    it('should evaluate player exchange', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 0,
        includesPlayerExchange: true,
        exchangePlayers: [2, 3],
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const result = negotiator.evaluateBid(bid, listing, player);
      expect(result.meetsMinimum).toBe(false);
      expect(result.feedback).toContain('not valuable enough');
    });
  });

  describe('generateCounterOffer', () => {
    const listing = { askingPrice: 50000000, minimumFee: 45000000 };

    it('should generate aggressive counter near asking price', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 40000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const counter = negotiator.generateCounterOffer(bid, listing, 'aggressive');
      expect(counter).toBeGreaterThanOrEqual(47500000); // 95% of asking
      expect(counter).toBeLessThanOrEqual(50000000);
    });

    it('should generate passive counter with small increase', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 40000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const counter = negotiator.generateCounterOffer(bid, listing, 'passive');
      expect(counter).toBeGreaterThan(40000000);
      expect(counter).toBeLessThan(45000000); // 10% increase
    });

    it('should respect minimum fee in counter', () => {
      const bid = {
        id: 'bid1',
        playerId: 1,
        buyerTeamId: 2,
        sellerTeamId: 1,
        amount: 40000000,
        status: 'pending' as const,
        createdAt: new Date().toISOString(),
      };

      const counter = negotiator.generateCounterOffer(bid, listing, 'passive');
      expect(counter).toBeGreaterThanOrEqual(listing.minimumFee!);
    });
  });

  describe('negotiateContract', () => {
    it('should accept reasonable salary within 20% of fair value', () => {
      const fairContract = { salary: 80000, contractLength: 3 };
      const proposed = { ...fairContract, salary: 90000 }; // 12.5% higher

      const result = negotiator.negotiateContract(player, proposed, team.budget, 50000);
      expect(result.accepted).toBe(true);
    });

    it('should counter high salary request', () => {
      const proposed = { salary: 200000, contractLength: 3 };

      const result = negotiator.negotiateContract(player, proposed, team.budget, 50000);
      expect(result.accepted).toBe(false);
      expect(result.counter).toBeDefined();
      expect(result.counter!.salary).toBeLessThan(200000);
      expect(result.counter!.salary).toBeGreaterThan(0);
    });

    it('should reject salary exceeding 5% of budget', () => {
      const lowBudgetTeam = createTestTeam(2, 1000000); // 1M budget
      const proposed = { salary: 100000, contractLength: 3 }; // 10% of budget weekly

      const result = negotiator.negotiateContract(player, proposed, lowBudgetTeam.budget, 50000);
      expect(result.accepted).toBe(false);
      expect(result.feedback).toContain('exceeds budget limit');
    });

    it('should calculate fair salary based on rating and position', () => {
      // Test different positions
      const defender = createTestPlayer(2, 1, 'center-back', 80);
      const striker = createTestPlayer(3, 1, 'striker', 80);

      const defenderContract = negotiator.negotiateContract(
        defender,
        { salary: 100000 },
        team.budget,
        50000
      );
      const strikerContract = negotiator.negotiateContract(
        striker,
        { salary: 100000 },
        team.budget,
        50000
      );

      // Striker should have higher fair salary due to multiplier
      expect(strikerContract.counter!.salary).toBeGreaterThan(defenderContract.counter!.salary);
    });
  });

  describe('assessTransferViability', () => {
    it('should approve viable transfer', () => {
      const player = createTestPlayer(1, 1, 'striker', 80);
      const contract = {
        salary: 80000,
        contractLength: 4,
        signingBonus: 1000000,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 4, 11, 31).toISOString(),
      };

      const result = negotiator.assessTransferViability(player, 40000000, contract, team);
      expect(result.viable).toBe(true);
      expect(result.projectedCost).toBeGreaterThan(0);
    });

    it('should reject transfer leaving insufficient buffer', () => {
      const player = createTestPlayer(1, 1, 'striker', 80);
      const contract = {
        salary: 200000,
        contractLength: 4,
        signingBonus: 0,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 4, 11, 31).toISOString(),
      };

      const lowBudgetTeam = createTestTeam(2, 50000000);
      const result = negotiator.assessTransferViability(player, 45000000, contract, lowBudgetTeam);
      expect(result.viable).toBe(false);
      expect(result.reason).toContain('insufficient budget buffer');
    });

    it('should reject transfers with unsustainable wage bill', () => {
      const player = createTestPlayer(1, 1, 'striker', 80);
      const contract = {
        salary: 1000000, // High weekly salary to exceed wage threshold
        contractLength: 4,
        signingBonus: 0,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 4, 11, 31).toISOString(),
      };

      const result = negotiator.assessTransferViability(player, 10000000, contract, team);
      expect(result.viable).toBe(false);
      expect(result.reason).toContain('exceed sustainable levels');
    });
  });

  describe('getNegotiationDeadline', () => {
    it('should return deadline 2 days from now', () => {
      const deadline = negotiator.getNegotiationDeadline();
      const deadlineDate = new Date(deadline);
      const now = new Date();
      const diffHours = (deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      expect(diffHours).toBeGreaterThan(47);
      expect(diffHours).toBeLessThan(49);
    });
  });

  describe('hasNegotiationTimedOut', () => {
    it('should detect timed out negotiations', () => {
      const oldDate = new Date(Date.now() - 86400000 * 2); // 2 days ago
      const timedOut = negotiator.hasNegotiationTimedOut(oldDate.toISOString());
      expect(timedOut).toBe(true);
    });

    it('should not flag recent negotiations as timed out', () => {
      const recentDate = new Date(Date.now() - 3600000); // 1 hour ago
      const timedOut = negotiator.hasNegotiationTimedOut(recentDate.toISOString());
      expect(timedOut).toBe(false);
    });
  });
});
