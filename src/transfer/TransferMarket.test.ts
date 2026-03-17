import { TransferMarket } from './TransferMarket';
import { Player, Team } from '../models';

// Helper to create test player
function createTestPlayer(
  id: number,
  teamId: number,
  position: string = 'striker',
  rating: number = 75,
  salary: number = 50000
): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    dateOfBirth: '1995-01-01',
    position: position as any,
    currentRating: rating,
    potential: rating + 10,
    contract: {
      teamId,
      salary,
      expiryDate: '2026-06-30',
    },
    stats: {
      goals: 10,
      assists: 5,
      appearances: 30,
      minutesPlayed: 2700,
    },
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

describe('TransferMarket', () => {
  let players: Player[];
  let teams: Team[];
  let transferMarket: TransferMarket;

  beforeEach(() => {
    // Create test data
    teams = [
      createTestTeam(1, 150000000),
      createTestTeam(2, 100000000),
      createTestTeam(3, 80000000),
    ];
    players = [
      createTestPlayer(1, 1, 'striker', 80, 100000),
      createTestPlayer(2, 1, 'goalkeeper', 75, 60000),
      createTestPlayer(3, 2, 'defender', 70, 45000),
      createTestPlayer(4, 2, 'midfielder', 82, 80000),
      createTestPlayer(5, 3, 'striker', 85, 120000),
    ];

    // Initialize teams' players arrays
    teams.forEach((team) => {
      team.players = players.filter((p) => p.contract.teamId === team.id).map((p) => p.id);
    });

    transferMarket = new TransferMarket(players, teams);
  });

  describe('listPlayer', () => {
    it('should list a player successfully', () => {
      const result = transferMarket.listPlayer(1, 50000000);
      expect(result).toBe(true);

      const listing = transferMarket.getPlayerWithListing(1);
      expect(listing).not.toBeNull();
      expect(listing!.listing.askingPrice).toBe(50000000);
      expect(listing!.listing.status).toBe('available');
    });

    it('should fail to list a non-existent player', () => {
      const result = transferMarket.listPlayer(999, 50000000);
      expect(result).toBe(false);
    });

    it('should fail to list a player without a valid team', () => {
      const playerWithoutTeam = createTestPlayer(6, 999);
      players.push(playerWithoutTeam);
      const result = transferMarket.listPlayer(6, 50000000);
      expect(result).toBe(false);
    });
  });

  describe('withdrawListing', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
    });

    it('should withdraw a listing successfully', () => {
      const result = transferMarket.withdrawListing(1);
      expect(result).toBe(true);

      const listing = transferMarket.getPlayerWithListing(1);
      expect(listing).not.toBeNull();
      expect(listing!.listing.status).toBe('withdrawn');
    });

    it('should fail to withdraw a non-existent listing', () => {
      const result = transferMarket.withdrawListing(999);
      expect(result).toBe(false);
    });
  });

  describe('searchListings', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000); // striker, rating 80
      transferMarket.listPlayer(2, 30000000); // goalkeeper, rating 75
      transferMarket.listPlayer(5, 80000000); // striker, rating 85
    });

    it('should search all available listings with no filters', () => {
      const results = transferMarket.searchListings({});
      expect(results.length).toBe(3);
    });

    it('should filter by position', () => {
      const results = transferMarket.searchListings({ positions: ['striker'] });
      expect(results.length).toBe(2);
      results.forEach((r) => expect(r.position).toBe('striker'));
    });

    it('should filter by min rating', () => {
      const results = transferMarket.searchListings({ minRating: 80 });
      expect(results.length).toBe(2);
    });

    it('should filter by max salary', () => {
      const results = transferMarket.searchListings({ maxSalary: 70000 });
      expect(results.length).toBe(1);
      expect(results[0].id).toBe(2);
    });

    it('should filter by age range', () => {
      const results = transferMarket.searchListings({ minAge: 28, maxAge: 35 });
      // All players are born in 1995, so in 2024-2025 they'd be 29-30
      expect(results.length).toBeGreaterThan(0);
    });

    it('should only return available listings', () => {
      transferMarket.withdrawListing(2);
      const results = transferMarket.searchListings({});
      expect(results.length).toBe(2);
    });
  });

  describe('placeBid', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
    });

    it('should place a bid successfully', () => {
      const bid = transferMarket.placeBid(1, 2, 45000000);
      expect(bid).not.toBeNull();
      expect(bid!.status).toBe('pending');
      expect(bid!.amount).toBe(45000000);
    });

    it('should fail if buyer budget insufficient', () => {
      const bid = transferMarket.placeBid(1, 3, 200000000);
      expect(bid).toBeNull();
    });

    it('should fail if player not listed', () => {
      const bid = transferMarket.placeBid(999, 2, 45000000);
      expect(bid).toBeNull();
    });

    it('should include optional parameters', () => {
      const bid = transferMarket.placeBid(1, 2, 45000000, {
        expiresAt: '2024-12-31T23:59:59Z',
        notes: 'Serious offer',
      });
      expect(bid!.expiresAt).toBe('2024-12-31T23:59:59Z');
      expect(bid!.notes).toBe('Serious offer');
    });
  });

  describe('acceptBid and rejectBid', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
      transferMarket.placeBid(1, 2, 45000000);
    });

    it('should accept a bid', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids[0];

      const result = transferMarket.acceptBid(bid.id);
      expect(result).toBe(true);

      const updatedBid = transferMarket.getBidsForPlayer(1)[0];
      expect(updatedBid.status).toBe('accepted');

      const listing = transferMarket.getPlayerWithListing(1);
      expect(listing).not.toBeNull();
      expect(listing!.listing.status).toBe('sold');
    });

    it('should reject a bid', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids[0];

      const result = transferMarket.rejectBid(bid.id);
      expect(result).toBe(true);

      const updatedBid = transferMarket.getBidsForPlayer(1)[0];
      expect(updatedBid.status).toBe('rejected');
    });
  });

  describe('counterBid', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
      transferMarket.placeBid(1, 2, 40000000);
    });

    it('should create a counter offer', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids[0];

      const counter = transferMarket.counterBid(bid.id, 48000000);
      expect(counter).not.toBeNull();
      expect(counter!.amount).toBe(48000000);
      expect(counter!.status).toBe('pending');
      expect(counter!.counterBidId).toBe(bid.id);
    });

    it('should fail to counter a non-pending bid', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids[0];
      transferMarket.rejectBid(bid.id);

      const counter = transferMarket.counterBid(bid.id, 48000000);
      expect(counter).toBeNull();
    });
  });

  describe('completeTransfer', () => {
    let bidId: string;

    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
      const bid = transferMarket.placeBid(1, 2, 48000000);
      bidId = bid!.id;
      transferMarket.acceptBid(bidId);
    });

    it('should complete the transfer successfully', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids.find((b) => b.status === 'accepted')!;

      const result = transferMarket.completeTransfer(bid.id, {
        salary: 120000,
        contractLength: 4,
        startDate: new Date().toISOString(),
        expiryDate: new Date(new Date().getFullYear() + 4, 11, 31).toISOString(),
      });

      expect(result).toBe(true);

      // Check player transferred
      const player = players.find((p) => p.id === 1);
      expect(player!.contract.teamId).toBe(2);

      // Check budgets updated
      expect(teams[1].budget).toBe(100000000 - 48000000); // team 2 buyer (initial 100M)
      expect(teams[0].budget).toBe(150000000 + 48000000); // team 1 seller (initial 150M)

      // Check bid completed
      const completedBid = transferMarket.getBids().find((b) => b.id === bid.id);
      expect(completedBid).not.toBeUndefined();
      expect(completedBid!.status).toBe('completed');
    });

    it('should update team players lists', () => {
      const bids = transferMarket.getBidsForPlayer(1);
      const bid = bids.find((b) => b.status === 'accepted')!;

      transferMarket.completeTransfer(bid.id);

      // Player removed from seller squad
      expect(teams[0].players).not.toContain(1);
      // Player added to buyer squad
      expect(teams[1].players).toContain(1);
    });
  });

  describe('getMarketSummary', () => {
    it('should return summary of available listings', () => {
      transferMarket.listPlayer(5, 80000000); // rating 85
      transferMarket.listPlayer(1, 50000000); // rating 80

      const summary = transferMarket.getMarketSummary();

      expect(summary.totalPlayers).toBe(2);
      expect(summary.avgRating).toBeCloseTo(82.5, 1);
      expect(summary.positions).toHaveProperty('striker');
    });

    it('should return empty summary when no listings', () => {
      const summary = transferMarket.getMarketSummary();
      expect(summary.totalPlayers).toBe(0);
    });
  });

  describe('getBidsByBuyer and getBidsBySeller', () => {
    beforeEach(() => {
      transferMarket.listPlayer(1, 50000000);
      transferMarket.listPlayer(2, 30000000);
      transferMarket.placeBid(1, 2, 45000000);
      transferMarket.placeBid(2, 1, 25000000);
    });

    it('should get pending bids for buyer', () => {
      const buyerBids = transferMarket.getBidsByBuyer(2);
      expect(buyerBids.length).toBe(1);
      expect(buyerBids[0].playerId).toBe(1);
    });

    it('should get pending bids for seller', () => {
      const sellerBids = transferMarket.getBidsBySeller(1);
      expect(sellerBids.length).toBe(1);
      expect(sellerBids[0].playerId).toBe(2);
    });
  });

  describe('updateData', () => {
    it('should update internal players reference', () => {
      const newPlayers = [createTestPlayer(10, 1)];

      transferMarket.updatePlayers(newPlayers);

      // Verify through search
      const result = transferMarket.searchListings({});
      expect(Array.isArray(result)).toBe(true);
    });

    it('should update internal teams reference', () => {
      const newTeams = [createTestTeam(10)];

      transferMarket.updateTeams(newTeams);

      // Should not throw when using market functions
      expect(() => transferMarket.getMarketSummary()).not.toThrow();
    });
  });
});
