import { Player, Team } from '../models';
import {
  TransferListing,
  TransferMarketFilters,
  TransferMarketSummary,
  Bid,
  ContractDetails,
} from './types';

/**
 * Manages the transfer market operations including listing players,
 * searching/filtering, and tracking bids.
 */
export class TransferMarket {
  private listings: Map<number, TransferListing>; // playerId -> listing
  private bids: Bid[];
  private players: Player[];
  private teams: Team[];

  constructor(players: Player[], teams: Team[]) {
    this.players = players;
    this.teams = teams;
    this.listings = new Map();
    this.bids = [];
  }

  /**
   * List a player on the transfer market
   */
  listPlayer(
    playerId: number,
    askingPrice: number,
    options?: {
      minimumFee?: number;
      deadline?: string;
      preferredPositions?: string[];
      reason?: string;
    }
  ): boolean {
    const player = this.players.find((p) => p.id === playerId);
    if (!player) {
      return false;
    }

    // Check player is with selling team
    const sellerTeam = this.teams.find((t) => t.id === player.contract.teamId);
    if (!sellerTeam) {
      return false;
    }

    const listing: TransferListing = {
      playerId,
      teamId: sellerTeam.id,
      askingPrice,
      minimumFee: options?.minimumFee,
      status: 'available',
      listedDate: new Date().toISOString(),
      deadline: options?.deadline,
      preferredPositions: options?.preferredPositions,
      reason: options?.reason,
    };

    this.listings.set(playerId, listing);
    return true;
  }

  /**
   * Withdraw a player from the market
   */
  withdrawListing(playerId: number): boolean {
    const listing = this.listings.get(playerId);
    if (!listing || listing.status !== 'available') {
      return false;
    }

    listing.status = 'withdrawn';
    this.listings.set(playerId, listing);
    return true;
  }

  /**
   * Get all available listings
   */
  getAvailableListings(): TransferListing[] {
    return Array.from(this.listings.values()).filter(
      (l) => l.status === 'available' && (!l.deadline || new Date(l.deadline) > new Date())
    );
  }

  /**
   * Search players on the transfer market with filters
   */
  searchListings(filters: TransferMarketFilters): (Player & { listing: TransferListing })[] {
    const available = this.getAvailableListings();

    return available
      .map((listing) => {
        const player = this.players.find((p) => p.id === listing.playerId);
        return player ? { ...player, listing } : null;
      })
      .filter((p): p is Player & { listing: TransferListing } => p !== null)
      .filter((p) => this.matchesFilters(p, filters));
  }

  /**
   * Check if a player matches the given filters
   */
  private matchesFilters(
    player: Player & { listing: TransferListing },
    filters: TransferMarketFilters
  ): boolean {
    if (filters.positions && !filters.positions.includes(player.position)) {
      return false;
    }

    const age = this.calculateAge(player.dateOfBirth);
    if (filters.minAge !== undefined && age < filters.minAge) return false;
    if (filters.maxAge !== undefined && age > filters.maxAge) return false;

    if (filters.minRating !== undefined && player.currentRating < filters.minRating) return false;
    if (filters.maxRating !== undefined && player.currentRating > filters.maxRating) return false;

    if (filters.maxSalary !== undefined && player.contract.salary > filters.maxSalary) return false;

    if (filters.nationality && player.nationality !== filters.nationality) return false;

    if (filters.isAvailable !== undefined && filters.isAvailable !== true) {
      // If isAvailable is false, we return players NOT on the market
      return false;
    }

    if (filters.contractExpiringWithin !== undefined) {
      const monthsUntilExpiry = this.calculateMonthsUntilExpiry(player.contract.expiryDate);
      if (monthsUntilExpiry > filters.contractExpiringWithin) return false;
    }

    return true;
  }

  /**
   * Calculate player age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Calculate months until contract expiry
   */
  private calculateMonthsUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    const months =
      (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth());
    return months;
  }

  /**
   * Place a bid for a player
   */
  placeBid(
    playerId: number,
    buyerTeamId: number,
    amount: number,
    options?: {
      paymentStructure?: Bid['paymentStructure'];
      includesPlayerExchange?: boolean;
      exchangePlayers?: number[];
      expiresAt?: string;
      notes?: string;
    }
  ): Bid | null {
    const listing = this.listings.get(playerId);
    if (!listing || listing.status !== 'available') {
      return null;
    }

    const buyerTeam = this.teams.find((t) => t.id === buyerTeamId);
    const sellerTeam = this.teams.find((t) => t.id === listing.teamId);
    if (!buyerTeam || !sellerTeam) {
      return null;
    }

    // Check if buyer has sufficient budget
    if (buyerTeam.budget < amount) {
      return null;
    }

    const bid: Bid = {
      id: this.generateBidId(),
      playerId,
      buyerTeamId,
      sellerTeamId: sellerTeam.id,
      amount,
      paymentStructure: options?.paymentStructure,
      includesPlayerExchange: options?.includesPlayerExchange || false,
      exchangePlayers: options?.exchangePlayers,
      status: 'pending',
      createdAt: new Date().toISOString(),
      expiresAt: options?.expiresAt,
      notes: options?.notes,
    };

    this.bids.push(bid);
    return bid;
  }

  /**
   * Accept a bid
   */
  acceptBid(bidId: string): boolean {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid || bid.status !== 'pending') {
      return false;
    }

    bid.status = 'accepted';

    // Update listing status
    const listing = this.listings.get(bid.playerId);
    if (listing) {
      listing.status = 'sold';
    }

    return true;
  }

  /**
   * Reject a bid
   */
  rejectBid(bidId: string): boolean {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid || bid.status !== 'pending') {
      return false;
    }

    bid.status = 'rejected';
    return true;
  }

  /**
   * Counter a bid with a different amount
   */
  counterBid(originalBidId: string, counterAmount: number): Bid | null {
    const originalBid = this.bids.find((b) => b.id === originalBidId);
    if (!originalBid || originalBid.status !== 'pending') {
      return null;
    }

    const counterBid: Bid = {
      id: this.generateBidId(),
      playerId: originalBid.playerId,
      buyerTeamId: originalBid.buyerTeamId,
      sellerTeamId: originalBid.sellerTeamId,
      amount: counterAmount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      counterBidId: originalBidId,
    };

    this.bids.push(counterBid);
    return counterBid;
  }

  /**
   * Withdraw a bid
   */
  withdrawBid(bidId: string): boolean {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid || bid.status !== 'pending') {
      return false;
    }

    bid.status = 'withdrawn';
    return true;
  }

  /**
   * Get bids for a specific player
   */
  getBidsForPlayer(playerId: number): Bid[] {
    return this.bids.filter((b) => b.playerId === playerId);
  }

  /**
   * Get bids by buyer team
   */
  getBidsByBuyer(teamId: number): Bid[] {
    return this.bids.filter((b) => b.buyerTeamId === teamId && b.status === 'pending');
  }

  /**
   * Get bids by seller team
   */
  getBidsBySeller(teamId: number): Bid[] {
    return this.bids.filter((b) => b.sellerTeamId === teamId && b.status === 'pending');
  }

  /**
   * Get all bids
   */
  getBids(): Bid[] {
    return this.bids;
  }

  /**
   * Complete a transfer (when bid accepted)
   */
  completeTransfer(bidId: string, contractDetails?: ContractDetails): boolean {
    const bid = this.bids.find((b) => b.id === bidId);
    if (!bid || bid.status !== 'accepted') {
      return false;
    }

    const buyer = this.teams.find((t) => t.id === bid.buyerTeamId);
    const seller = this.teams.find((t) => t.id === bid.sellerTeamId);
    const player = this.players.find((p) => p.id === bid.playerId);

    if (!buyer || !seller || !player) {
      return false;
    }

    // Transfer budget
    seller.budget += bid.amount;
    buyer.budget -= bid.amount;

    // Transfer player ownership
    player.contract.teamId = buyer.id;

    // Update contract if provided
    if (contractDetails) {
      player.contract = {
        teamId: buyer.id,
        salary: contractDetails.salary,
        expiryDate: contractDetails.expiryDate,
      };
    }

    // Update team players lists if they exist
    if (seller.players) {
      seller.players = seller.players.filter((id) => id !== player.id);
    }
    if (buyer.players) {
      if (!buyer.players.includes(player.id)) {
        buyer.players.push(player.id);
      }
    }

    bid.status = 'completed'; // Mark as completed
    return true;
  }

  /**
   * Get transfer market summary statistics
   */
  getMarketSummary(): TransferMarketSummary {
    const available = this.getAvailableListings();
    const listedPlayers = available
      .map((l) => this.players.find((p) => p.id === l.playerId))
      .filter(Boolean) as Player[];

    if (listedPlayers.length === 0) {
      return {
        totalPlayers: 0,
        avgAge: 0,
        avgRating: 0,
        avgSalary: 0,
        positions: {},
        totalValue: 0,
      };
    }

    const totalAge = listedPlayers.reduce((sum, p) => sum + this.calculateAge(p.dateOfBirth), 0);
    const totalRating = listedPlayers.reduce((sum, p) => sum + p.currentRating, 0);
    const totalSalary = listedPlayers.reduce((sum, p) => sum + p.contract.salary, 0);

    const positions: Record<string, number> = {};
    listedPlayers.forEach((p) => {
      positions[p.position] = (positions[p.position] || 0) + 1;
    });

    return {
      totalPlayers: listedPlayers.length,
      avgAge: totalAge / listedPlayers.length,
      avgRating: totalRating / listedPlayers.length,
      avgSalary: totalSalary / listedPlayers.length,
      positions,
      totalValue: listedPlayers.reduce((sum, p) => sum + p.currentRating * 1000, 0), // rough estimate
    };
  }

  /**
   * Get player with listing details
   */
  getPlayerWithListing(playerId: number): (Player & { listing: TransferListing }) | null {
    const listing = this.listings.get(playerId);
    if (!listing) return null;

    const player = this.players.find((p) => p.id === playerId);
    if (!player) return null;

    return { ...player, listing };
  }

  /**
   * Generate unique bid ID
   */
  private generateBidId(): string {
    return `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Update internal players reference (when squad changes)
   */
  updatePlayers(players: Player[]): void {
    this.players = players;
  }

  /**
   * Update internal teams reference (when teams change)
   */
  updateTeams(teams: Team[]): void {
    this.teams = teams;
  }
}

/**
 * Factory function
 */
export function createTransferMarket(players: Player[], teams: Team[]): TransferMarket {
  return new TransferMarket(players, teams);
}
