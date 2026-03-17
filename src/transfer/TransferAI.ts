import { Player, Team } from '../models';
import { TransferMarket } from './TransferMarket';
import { Scout, ScoutManager } from './Scout';
import { Negotiator } from './Negotiator';

/**
 * TransferAI handles AI club decisions for transfers
 */
export class TransferAI {
  private readonly team: Team;
  private readonly transferMarket: TransferMarket;
  private readonly scoutManager: ScoutManager;
  private readonly negotiator: Negotiator;
  private readonly riskTolerance: number; // 0-1 scale
  private readonly aggression: number; // 0-1 scale
  private readonly players: Player[];

  constructor(
    team: Team,
    transferMarket: TransferMarket,
    scoutManager: ScoutManager,
    negotiator: Negotiator,
    players: Player[],
    riskTolerance: number = 0.5,
    aggression: number = 0.5
  ) {
    this.team = team;
    this.transferMarket = transferMarket;
    this.scoutManager = scoutManager;
    this.negotiator = negotiator;
    this.players = players;
    this.riskTolerance = Math.max(0, Math.min(1, riskTolerance));
    this.aggression = Math.max(0, Math.min(1, aggression));
  }

  /**
   * Perform automatic transfer decisions for the AI team
   */
  async performTransferActivity(): Promise<TransferActivityReport> {
    const actions: TransferAction[] = [];

    // 1. Identify squad needs
    const needs = this.identifySquadNeeds();

    // 2. Search for targets based on needs
    for (const need of needs) {
      if (need.priority > 0.3) {
        // Only pursue high-priority needs
        const targets = this.findTransferTargets(need);

        for (const target of targets.slice(0, 2)) {
          // Consider top 2 targets
          if (this.shouldPursuePlayer(target, need)) {
            const action = await this.pursuePlayer(target, need);
            if (action) {
              actions.push(action);
            }
          }
        }
      }
    }

    // 3. List surplus players
    const surplusPlayers = this.identifySurplusPlayers();
    for (const player of surplusPlayers) {
      if (this.shouldListPlayer(player)) {
        this.listSurplusPlayer(player);
        actions.push({
          type: 'list',
          playerId: player.id,
          reason: 'surplus squad member',
        });
      }
    }

    return {
      teamId: this.team.id,
      actions,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Identify squad needs based on current squad and performance
   */
  private identifySquadNeeds(): Array<{
    position: string;
    priority: number;
    reason: string;
  }> {
    const needs: Array<{ position: string; priority: number; reason: string }> = [];
    const squad = this.getTeamSquad();

    // Count current players by position
    const positionCounts: { [key: string]: number } = {};
    const avgAgeByPosition: { [key: string]: number } = {};
    const avgRatingByPosition: { [key: string]: number } = {};

    for (const player of squad) {
      const pos = this.getPositionCategory(player.position);
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
      avgAgeByPosition[pos] = (avgAgeByPosition[pos] || 0) + this.calculateAge(player.dateOfBirth);
      avgRatingByPosition[pos] = (avgRatingByPosition[pos] || 0) + player.currentRating;
    }

    // Calculate averages
    for (const pos in avgAgeByPosition) {
      const count = positionCounts[pos];
      if (count > 0) {
        avgAgeByPosition[pos] /= count;
        avgRatingByPosition[pos] /= count;
      }
    }

    // Target squad composition (per competition rules)
    const targetComposition = {
      goalkeeper: 2,
      defender: 6,
      midfielder: 6,
      forward: 4,
    };

    // Check for shortages
    for (const [position, target] of Object.entries(targetComposition)) {
      const current = positionCounts[position] || 0;
      const shortage = target - current;

      if (shortage > 0) {
        // Calculate priority based on shortage and team needs
        let priority = shortage / target;

        // Increase priority if aging squad in that position
        const avgAge = avgAgeByPosition[position] || 0;
        if (avgAge > 28) {
          priority += 0.2;
        }

        // Increase priority if low average rating
        const avgRating = avgRatingByPosition[position] || 0;
        if (avgRating < 70) {
          priority += 0.2;
        }

        needs.push({
          position,
          priority: Math.min(1, priority),
          reason: `Shortage of ${shortage} ${position}(s)${avgAge > 28 ? ' - aging' : ''}${avgRating < 70 ? ' - underperforming' : ''}`,
        });
      }
    }

    return needs.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Find transfer targets that match a need
   */
  private findTransferTargets(need: {
    position: string;
    priority: number;
  }): Array<{ player: Player; listing: any; score: number }> {
    // Search for available players in needed position
    const filters = {
      positions: this.getPositionsForCategory(need.position),
      isAvailable: true,
      minRating: 65,
    };

    const results = this.transferMarket.searchListings(filters);

    // Score each target
    const scoredTargets = results.map((result) => {
      const score = this.scoreTransferTarget(result, need);
      return { player: result, listing: result.listing, score };
    });

    return scoredTargets.filter((s) => s.score > 0.3).sort((a, b) => b.score - a.score);
  }

  /**
   * Score a transfer target
   */
  private scoreTransferTarget(
    target: Player & { listing: any },
    need: { position: string; priority: number }
  ): number {
    let score = 0;

    // Position match
    if (target.position === need.position) {
      score += 0.3;
    } else if (this.getPositionCategory(target.position) === need.position) {
      score += 0.2;
    } else {
      return 0; // Poor position fit
    }

    // Rating
    const ratingScore = (target.currentRating - 60) / 40; // Normalize 60-100 to 0-1
    score += ratingScore * 0.3;

    // Age
    const age = this.calculateAge(target.dateOfBirth);
    let ageScore = 0;
    if (age >= 22 && age <= 28) {
      ageScore = 1; // Prime age
    } else if (age < 22) {
      ageScore = 0.7; // Potential
    } else if (age <= 30) {
      ageScore = 0.6; // Experience
    }
    score += ageScore * 0.2;

    // Value for money
    const valueScore = Math.min(1, (target.currentRating * 1000) / target.listing.askingPrice);
    score += valueScore * 0.2;

    // Multiply by need priority
    score *= need.priority;

    return score;
  }

  /**
   * Decide whether to pursue a player
   */
  private shouldPursuePlayer(
    target: { player: Player; listing: any; score: number },
    need: { position: string; priority: number }
  ): boolean {
    // Only pursue if score is good enough
    if (target.score < 0.5) return false;

    // Check budget
    if (target.listing.askingPrice > this.team.budget * 0.3) {
      return false;
    }

    // Aggressive AI more likely to pursue
    const pursuitChance = 0.3 + this.aggression * 0.5;
    return Math.random() < pursuitChance;
  }

  /**
   * Pursue a player (scout, bid, negotiate)
   */
  private async pursuePlayer(
    target: { player: Player; listing: any; score: number },
    need: { position: string; priority: number }
  ): Promise<TransferAction | null> {
    const scout = this.scoutManager.requestScouting(target.player.id);
    if (!scout) return null;

    // Generate scouting report
    const report = scout.scoutPlayer(target.player, this.team);

    // Check if still interested after scouting
    if (report.rating < 70 || report.confidence < 0.6) {
      return null;
    }

    // Decide bid amount
    const initialBid = this.calculateInitialBid(
      target,
      report,
      need as { position: string; priority: number; reason: string }
    );

    // Place bid
    const bid = this.transferMarket.placeBid(target.player.id, this.team.id, initialBid, {
      expiresAt: this.negotiator.getNegotiationDeadline(),
    });

    if (!bid) return null;

    return {
      type: 'bid',
      playerId: target.player.id,
      amount: initialBid,
      reason: `Targeting ${need.position} (score: ${target.score.toFixed(2)})`,
      metadata: {
        scoutReport: report,
        bidId: bid.id,
      },
    };
  }

  /**
   * Calculate initial bid amount
   */
  private calculateInitialBid(
    target: { player: Player; listing: any; score: number },
    report: any,
    need: { position: string; priority: number; reason: string }
  ): number {
    const askingPrice = target.listing.askingPrice;
    const fairValue = target.player.currentRating * 1000;

    // Start below asking price but reasonable
    let bidAmount = Math.min(askingPrice * 0.8, fairValue * 0.9);

    // Adjust based on AI aggression
    bidAmount *= 1 - this.aggression * 0.2;

    // Adjust based on need priority
    bidAmount *= 1 + (need.priority - 0.5) * 0.2;

    return Math.round(bidAmount);
  }

  /**
   * Identify surplus players in squad
   */
  private identifySurplusPlayers(): Player[] {
    const squad = this.getTeamSquad();
    const surplus: Player[] = [];

    // Count by position
    const positionCounts: Record<string, number> = {};
    for (const player of squad) {
      const pos = this.getPositionCategory(player.position);
      positionCounts[pos] = (positionCounts[pos] || 0) + 1;
    }

    // Target max squad size
    const targetCounts: Record<string, number> = {
      goalkeeper: 3,
      defender: 7,
      midfielder: 7,
      forward: 5,
    };

    // Count-based surplus: positions exceeding target
    for (const position of squad) {
      const posCategory = this.getPositionCategory(position.position);
      if ((positionCounts[posCategory] || 0) > (targetCounts[posCategory] || 0)) {
        surplus.push(position);
        positionCounts[posCategory]--;
      }
    }

    // Quality-based surplus: in positions with depth (≥3 players), list low-rated or aging low-performers
    for (const player of squad) {
      if (surplus.includes(player)) continue; // already marked

      const posCategory = this.getPositionCategory(player.position);
      const playersInPosition = squad.filter(
        (p) => this.getPositionCategory(p.position) === posCategory
      );

      // Only consider positions with sufficient depth to afford removal
      if (playersInPosition.length >= 3) {
        const age = this.calculateAge(player.dateOfBirth);
        const isLowRated = player.currentRating < 65;
        const isAgingLowPerformer = age > 30 && player.currentRating < 70;

        if (isLowRated || isAgingLowPerformer) {
          surplus.push(player);
        }
      }
    }

    return surplus;
  }

  /**
   * Decide whether to list a player
   */
  private shouldListPlayer(player: Player): boolean {
    const age = this.calculateAge(player.dateOfBirth);

    // PROTECTED: Young high-rated players should NOT be listed
    if (age < 25 && player.currentRating >= 80) {
      return false;
    }

    // Older players more likely to be listed
    if (age > 30) return true;

    // Low-rated players more likely to be listed
    if (player.currentRating < 65) return true;

    // Contract expiring soon - might be listed
    const monthsUntilExpiry = this.getMonthsUntilExpiry(player.contract.expiryDate);
    if (monthsUntilExpiry <= 12) {
      return Math.random() < 0.5;
    }

    return false;
  }

  /**
   * List surplus player on market
   */
  private listSurplusPlayer(player: Player): boolean {
    const value = player.currentRating * 1000; // Rough valuation
    const askingPrice = Math.round(value * 0.7);

    return this.transferMarket.listPlayer(player.id, askingPrice, {
      reason: 'Squad restructuring',
    });
  }

  /**
   * Get team squad
   */
  private getTeamSquad(): Player[] {
    // Filter players belonging to this team
    return this.players.filter((p) => p.contract.teamId === this.team.id);
  }

  /**
   * Get position category
   */
  private getPositionCategory(position: string): string {
    if (position === 'goalkeeper') return 'goalkeeper';
    if (position.includes('back') || position === 'center-back') return 'defender';
    if (position.includes('midfielder')) return 'midfielder';
    return 'forward';
  }

  /**
   * Get all positions that belong to a category
   */
  private getPositionsForCategory(category: string): string[] {
    switch (category) {
      case 'goalkeeper':
        return ['goalkeeper'];
      case 'defender':
        return ['right-back', 'left-back', 'center-back'];
      case 'midfielder':
        return ['defensive-midfielder', 'central-midfielder', 'attacking-midfielder'];
      case 'forward':
        return ['right-winger', 'left-winger', 'striker'];
      default:
        return [];
    }
  }

  /**
   * Calculate age from date of birth
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
   * Get months until contract expiry
   */
  private getMonthsUntilExpiry(expiryDate: string): number {
    const today = new Date();
    const expiry = new Date(expiryDate);
    return (
      (expiry.getFullYear() - today.getFullYear()) * 12 + (expiry.getMonth() - today.getMonth())
    );
  }
}

/**
 * Transfer action type
 */
export interface TransferAction {
  type: 'bid' | 'list' | 'accept_bid' | 'reject_bid' | 'counter_bid';
  playerId: number;
  amount?: number;
  reason: string;
  metadata?: any;
}

/**
 * Transfer activity report
 */
export interface TransferActivityReport {
  teamId: number;
  actions: TransferAction[];
  timestamp: string;
}

/**
 * Factory function
 */
export function createTransferAI(
  team: Team,
  transferMarket: TransferMarket,
  scoutManager: ScoutManager,
  negotiator: Negotiator,
  players: Player[],
  riskTolerance?: number,
  aggression?: number
): TransferAI {
  return new TransferAI(
    team,
    transferMarket,
    scoutManager,
    negotiator,
    players,
    riskTolerance,
    aggression
  );
}
