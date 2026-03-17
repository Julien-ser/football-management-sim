import { Player, Team, Competition } from '../models';
import { TransferMarket } from './TransferMarket';
import { ScoutManager } from './Scout';
import { Negotiator } from './Negotiator';
import { SquadRegistrationManager } from './SquadRegistration';
import { TransferAI, TransferAction, TransferActivityReport, createTransferAI } from './TransferAI';
import { Bid, ContractDetails, ScoutReport } from './types';

/**
 * TransferManager serves as the main facade for all transfer-related operations.
 * It coordinates between the transfer market, scouting, negotiations, squad registration, and AI behavior.
 */
export class TransferManager {
  private transferMarket: TransferMarket;
  private scoutManager: ScoutManager;
  private negotiator: Negotiator;
  private squadRegistration: SquadRegistrationManager;
  private transferAIs: Map<number, TransferAI>; // teamId -> TransferAI
  private players: Player[];
  private teams: Team[];
  private competitions: Competition[];

  constructor(
    players: Player[],
    teams: Team[],
    competitions: Competition[],
    options?: {
      negotiationTimeout?: number;
      maxNegotiationRounds?: number;
    }
  ) {
    this.players = players;
    this.teams = teams;
    this.competitions = competitions;
    this.scoutManager = new ScoutManager();
    this.negotiator = new Negotiator(options?.negotiationTimeout, options?.maxNegotiationRounds);
    this.transferMarket = new TransferMarket(players, teams);
    this.squadRegistration = new SquadRegistrationManager(players, teams, competitions);
    this.transferAIs = new Map();
  }

  /**
   * Initialize AI clubs' transfer behavior
   */
  initializeAI(teamIds?: number[]): void {
    const teamsToInit = teamIds || this.teams.map((t) => t.id);

    for (const teamId of teamsToInit) {
      const team = this.teams.find((t) => t.id === teamId);
      if (!team) continue;

      const ai = createTransferAI(
        team,
        this.transferMarket,
        this.scoutManager,
        this.negotiator,
        this.players
      );
      this.transferAIs.set(teamId, ai);
    }
  }

  /**
   * Perform AI transfer activity for all AI-controlled teams
   */
  async performAIActivity(teamIds?: number[]): Promise<Map<number, TransferActivityReport>> {
    const reports = new Map<number, TransferActivityReport>();
    const teamsToProcess = teamIds || Array.from(this.transferAIs.keys());

    for (const teamId of teamsToProcess) {
      const ai = this.transferAIs.get(teamId);
      if (ai) {
        const report = await ai.performTransferActivity();
        reports.set(teamId, report);
      }
    }

    return reports;
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
    return this.transferMarket.listPlayer(playerId, askingPrice, options);
  }

  /**
   * Withdraw a player from the market
   */
  withdrawListing(playerId: number): boolean {
    return this.transferMarket.withdrawListing(playerId);
  }

  /**
   * Search for players on the transfer market
   */
  searchListings(filters: any) {
    return this.transferMarket.searchListings(filters);
  }

  /**
   * Place a bid for a player
   */
  placeBid(
    playerId: number,
    buyerTeamId: number,
    amount: number,
    options?: {
      paymentStructure?: any;
      includesPlayerExchange?: boolean;
      exchangePlayers?: number[];
      expiresAt?: string;
      notes?: string;
    }
  ): Bid | null {
    return this.transferMarket.placeBid(playerId, buyerTeamId, amount, options);
  }

  /**
   * Accept a bid
   */
  acceptBid(bidId: string): boolean {
    return this.transferMarket.acceptBid(bidId);
  }

  /**
   * Reject a bid
   */
  rejectBid(bidId: string): boolean {
    return this.transferMarket.rejectBid(bidId);
  }

  /**
   * Counter a bid
   */
  counterBid(bidId: string, counterAmount: number): Bid | null {
    return this.transferMarket.counterBid(bidId, counterAmount);
  }

  /**
   * Complete a transfer with contract negotiation
   */
  completeTransfer(bidId: string, contractDetails?: Partial<ContractDetails>): boolean {
    const bid = this.transferMarket.getBids().find((b) => b.id === bidId);
    if (!bid) return false;

    // Get player and teams involved
    const player = this.players.find((p) => p.id === bid.playerId);
    const buyer = this.teams.find((t) => t.id === bid.buyerTeamId);
    const seller = this.teams.find((t) => t.id === bid.sellerTeamId);

    if (!player || !buyer || !seller) return false;

    // Negotiate contract if not provided
    let finalContract = contractDetails;
    if (!finalContract) {
      // Get team average wage for negotiation context
      const teamWages = this.players
        .filter((p) => p.contract.teamId === buyer.id)
        .map((p) => p.contract.salary);

      const avgWage =
        teamWages.length > 0 ? teamWages.reduce((a, b) => a + b, 0) / teamWages.length : 0;

      const negotiation = this.negotiator.negotiateContract(
        player,
        { salary: contractDetails?.salary || 0 },
        buyer.budget,
        avgWage
      );

      if (negotiation.accepted && negotiation.counter) {
        finalContract = negotiation.counter;
      } else if (!negotiation.accepted) {
        return false; // Negotiation failed
      }
    }

    // Complete the transfer
    const success = this.transferMarket.completeTransfer(bidId, finalContract as ContractDetails);

    if (success) {
      // Update team players lists if they exist
      this.updateTeamPlayersLists(player, seller, buyer);

      // Update squad registrations
      this.updateSquadRegistrationsForTransfer(player, seller, buyer);
    }

    return success;
  }

  /**
   * Update team players lists when a transfer occurs
   */
  private updateTeamPlayersLists(player: Player, seller: Team, buyer: Team): void {
    // Remove from seller's players array if it exists
    if (seller.players) {
      seller.players = seller.players.filter((id) => id !== player.id);
    }

    // Add to buyer's players array if it exists
    if (!buyer.players) {
      buyer.players = [];
    }
    buyer.players.push(player.id);
  }

  /**
   * Update squad registrations after a transfer
   */
  private updateSquadRegistrationsForTransfer(player: Player, seller: Team, buyer: Team): void {
    // Remove player from seller's registrations
    const sellerRegistrations = this.squadRegistration.getTeamRegistrations(seller.id);
    for (const reg of sellerRegistrations) {
      this.squadRegistration.removePlayersFromSquad(seller.id, reg.competitionId, reg.season, [
        player.id,
      ]);
    }

    // Note: Player would need to be registered by buyer manually through registerSquad()
  }

  /**
   * Scout a player
   */
  scoutPlayer(playerId: number, requestingTeamId: number): ScoutReport[] | null {
    const player = this.players.find((p) => p.id === playerId);
    const team = this.teams.find((t) => t.id === requestingTeamId);

    if (!player || !team) return null;

    const scout = this.scoutManager.requestScouting(playerId);
    if (!scout) return null;

    return this.scoutManager.completeScouting(playerId, player, team);
  }

  /**
   * Get available scouts
   */
  getAvailableScouts(): any[] {
    return this.scoutManager.getScouts();
  }

  /**
   * Register a squad for a competition
   */
  registerSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[],
    slots?: any[]
  ) {
    return this.squadRegistration.registerSquad(
      teamId,
      competitionId,
      season,
      playerIds,
      slots || []
    );
  }

  /**
   * Validate a squad
   */
  validateSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[],
    slots: any[]
  ) {
    const rules = this.squadRegistration['getCompetitionRules'](
      this.competitions.find((c) => c.id === competitionId)?.type || 'league'
    );
    return this.squadRegistration['validateSquad'](playerIds, slots, rules, teamId, competitionId);
  }

  /**
   * Get transfer market summary
   */
  getMarketSummary() {
    return this.transferMarket.getMarketSummary();
  }

  /**
   * Get player with listing details
   */
  getPlayerWithListing(playerId: number) {
    return this.transferMarket.getPlayerWithListing(playerId);
  }

  /**
   * Get bids for a player
   */
  getBidsForPlayer(playerId: number) {
    return this.transferMarket.getBidsForPlayer(playerId);
  }

  /**
   * Get pending bids for a team (as buyer)
   */
  getBuyerBids(teamId: number) {
    return this.transferMarket.getBidsByBuyer(teamId);
  }

  /**
   * Get pending bids for a team (as seller)
   */
  getSellerBids(teamId: number) {
    return this.transferMarket.getBidsBySeller(teamId);
  }

  /**
   * Evaluate a bid for a selling team
   */
  evaluateBid(bidId: string): { meetsMinimum: boolean; feedback: string } {
    const bid = this.transferMarket.getBids().find((b) => b.id === bidId);
    if (!bid) return { meetsMinimum: false, feedback: 'Bid not found' };

    const listing = this.transferMarket.getPlayerWithListing(bid.playerId);
    if (!listing) return { meetsMinimum: false, feedback: 'Listing not found' };

    const player = this.players.find((p) => p.id === bid.playerId);
    if (!player) return { meetsMinimum: false, feedback: 'Player not found' };

    return this.negotiator.evaluateBid(bid, listing.listing, player);
  }

  /**
   * Generate a counter-offer
   */
  generateCounterOffer(
    bidId: string,
    strategy?: 'aggressive' | 'moderate' | 'passive'
  ): number | null {
    const bid = this.transferMarket.getBids().find((b) => b.id === bidId);
    if (!bid) return null;

    const listing = this.transferMarket.getPlayerWithListing(bid.playerId);
    if (!listing) return null;

    return this.negotiator.generateCounterOffer(bid, listing.listing, strategy);
  }

  /**
   * Assess transfer viability for a team
   */
  assessTransferViability(
    playerId: number,
    bidAmount: number,
    contractDetails: ContractDetails,
    teamId: number
  ) {
    const player = this.players.find((p) => p.id === playerId);
    const team = this.teams.find((t) => t.id === teamId);

    if (!player || !team) {
      return { viable: false, reason: 'Player or team not found', projectedCost: 0 };
    }

    return this.negotiator.assessTransferViability(player, bidAmount, contractDetails, team);
  }

  /**
   * Get squad registration for a team/competition
   */
  getSquadRegistration(teamId: number, competitionId: number, season: string) {
    return this.squadRegistration.getRegistration(teamId, competitionId, season);
  }

  /**
   * Get all registrations for a team
   */
  getTeamRegistrations(teamId: number, season?: string) {
    return this.squadRegistration.getTeamRegistrations(teamId, season);
  }

  /**
   * Check if player is registered for a competition
   */
  isPlayerRegistered(
    playerId: number,
    teamId: number,
    competitionId: number,
    season: string
  ): boolean {
    return this.squadRegistration.isPlayerRegistered(playerId, teamId, competitionId, season);
  }

  /**
   * Add players to squad registration
   */
  addPlayersToSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[]
  ): boolean {
    return this.squadRegistration.addPlayersToSquad(teamId, competitionId, season, playerIds);
  }

  /**
   * Remove players from squad registration
   */
  removePlayersFromSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[]
  ): boolean {
    return this.squadRegistration.removePlayersFromSquad(teamId, competitionId, season, playerIds);
  }

  /**
   * Update internal data references (when players/teams change)
   */
  updateData(players: Player[], teams: Team[], competitions?: Competition[]): void {
    this.players = players;
    this.teams = teams;
    if (competitions) {
      this.competitions = competitions;
      this.squadRegistration.updateCompetitions(competitions);
    }
    this.transferMarket.updatePlayers(players);
    this.transferMarket.updateTeams(teams);
    this.squadRegistration.updatePlayers(players);
    this.squadRegistration.updateTeams(teams);

    // Reinitialize AIs with new data
    this.transferAIs.clear();
    this.initializeAI();
  }

  /**
   * Get all players
   */
  getPlayers(): Player[] {
    return this.players;
  }

  /**
   * Get all teams
   */
  getTeams(): Team[] {
    return this.teams;
  }

  /**
   * Get player by ID
   */
  getPlayer(playerId: number): Player | undefined {
    return this.players.find((p) => p.id === playerId);
  }

  /**
   * Get team by ID
   */
  getTeam(teamId: number): Team | undefined {
    return this.teams.find((t) => t.id === teamId);
  }
}

/**
 * Factory function
 */
export function createTransferManager(
  players: Player[],
  teams: Team[],
  competitions: Competition[],
  options?: {
    negotiationTimeout?: number;
    maxNegotiationRounds?: number;
  }
): TransferManager {
  return new TransferManager(players, teams, competitions, options);
}
