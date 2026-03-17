import { Player, Team } from '../models';
import { Bid, ContractDetails } from './types';

/**
 * Negotiator handles bid evaluation, counter-offers, and contract negotiations
 */
export class Negotiator {
  private readonly negotiationTimeout: number; // milliseconds
  private readonly maxNegotiationRounds: number;

  constructor(negotiationTimeout?: number, maxNegotiationRounds?: number) {
    this.negotiationTimeout = negotiationTimeout || 86400000; // 24 hours default
    this.maxNegotiationRounds = maxNegotiationRounds || 3;
  }

  /**
   * Evaluate if a bid meets minimum requirements
   */
  evaluateBid(
    bid: Bid,
    listing: {
      askingPrice: number;
      minimumFee?: number;
    },
    player: Player
  ): { meetsMinimum: boolean; feedback: string } {
    const isPlayerExchange = bid.includesPlayerExchange;

    // If exchange involved, check exchange value first
    if (isPlayerExchange) {
      const exchangeValue = this.calculateExchangeValue(bid.exchangePlayers || [], player);
      if (exchangeValue < player.currentRating * 500) {
        return {
          meetsMinimum: false,
          feedback: 'Exchange players not valuable enough',
        };
      }
    }

    // Check minimum fee if set
    if (listing.minimumFee && bid.amount < listing.minimumFee) {
      return {
        meetsMinimum: false,
        feedback: `Bid (€${bid.amount}) below minimum fee (€${listing.minimumFee})`,
      };
    }

    // Check asking price
    if (bid.amount < listing.askingPrice) {
      return {
        meetsMinimum: false,
        feedback: `Bid (€${bid.amount}) below asking price (€${listing.askingPrice})`,
      };
    }

    return {
      meetsMinimum: true,
      feedback: 'Bid meets requirements',
    };
  }

  /**
   * Generate a counter-offer
   */
  generateCounterOffer(
    bid: Bid,
    listing: {
      askingPrice: number;
      minimumFee?: number;
    },
    strategy: 'aggressive' | 'moderate' | 'passive' = 'moderate'
  ): number {
    const askingPrice = listing.askingPrice;
    const currentBid = bid.amount;

    let counterAmount: number;

    switch (strategy) {
      case 'aggressive':
        // Close to asking price
        counterAmount = askingPrice * 0.95;
        break;
      case 'passive':
        // Small increase
        counterAmount = currentBid * 1.1;
        break;
      case 'moderate':
      default:
        // Middle ground
        counterAmount = Math.max(currentBid * 1.2, askingPrice * 0.85);
    }

    // Ensure counter is at least minimum fee
    if (listing.minimumFee && counterAmount < listing.minimumFee) {
      counterAmount = listing.minimumFee;
    }

    return Math.round(counterAmount);
  }

  /**
   * Negotiate contract details
   */
  negotiateContract(
    player: Player,
    proposedContract: Partial<ContractDetails>,
    teamBudget: number,
    teamAvgWage: number
  ): { accepted: boolean; counter?: ContractDetails; feedback: string } {
    const requestedSalary = proposedContract.salary || 0;

    // Check if salary is within budget (shouldn't exceed 5% of budget for one player)
    const maxIndividualSalary = teamBudget * 0.05;
    if (requestedSalary > maxIndividualSalary) {
      return {
        accepted: false,
        feedback: `Requested salary (€${requestedSalary}/week) exceeds budget limit (€${maxIndividualSalary}/week)`,
      };
    }

    // Calculate fair salary based on player rating
    const fairSalary = this.calculateFairSalary(player);

    if (requestedSalary <= fairSalary * 1.2) {
      // Within 20% of fair value, accept
      return {
        accepted: true,
        feedback: 'Contract terms accepted',
      };
    } else {
      // Propose counter-offer
      const counterSalary = Math.round(fairSalary * 1.1);
      const contractLength = proposedContract.contractLength || 3;
      const startDate = proposedContract.startDate || new Date().toISOString();
      const expiryDate = new Date(
        new Date(startDate).getFullYear() + contractLength,
        11,
        31
      ).toISOString();

      return {
        accepted: false,
        counter: {
          salary: counterSalary,
          bonusGoals: proposedContract.bonusGoals,
          bonusAssists: proposedContract.bonusAssists,
          bonusCleanSheet: proposedContract.bonusCleanSheet,
          signingBonus: proposedContract.signingBonus || 0,
          contractLength,
          startDate,
          expiryDate,
        },
        feedback: `Counter-offer: €${counterSalary}/week for ${contractLength} years`,
      };
    }
  }

  /**
   * Calculate fair salary based on player rating and position
   */
  private calculateFairSalary(player: Player): number {
    const rating = player.currentRating;
    const position = player.position;

    // Base rates by rating (weekly in euros)
    const baseByRating: Record<number, number> = {
      90: 250000, // World class
      85: 150000, // Elite
      80: 80000, // High
      75: 40000, // Good
      70: 20000, // Average
      65: 10000, // Below average
    };

    // Find closest rating bracket
    const ratingBrackets = [90, 85, 80, 75, 70, 65];
    let baseSalary = 5000; // default minimum

    for (const bracket of ratingBrackets) {
      if (rating >= bracket) {
        baseSalary = baseByRating[bracket];
        break;
      }
    }

    // Position adjustment
    const positionMultipliers: Record<string, number> = {
      goalkeeper: 1.0,
      striker: 1.2,
      'attacking-midfielder': 1.1,
      'right-winger': 1.1,
      'left-winger': 1.1,
      'central-midfielder': 1.0,
      'defensive-midfielder': 0.95,
      'center-back': 0.95,
      'right-back': 0.9,
      'left-back': 0.9,
    };

    const multiplier = positionMultipliers[position] || 1.0;

    return Math.round(baseSalary * multiplier);
  }

  /**
   * Calculate total value of exchange players
   */
  private calculateExchangeValue(playerIds: number[], targetPlayer: Player): number {
    // This would integrate with player data - for now return estimate
    // In real implementation, would look up player values and ratings
    // Simplified: return 80% of target player value as acceptable exchange
    const targetValue = targetPlayer.currentRating * 1000;
    return Math.round(targetValue * 0.8);
  }

  /**
   * Assess if a transfer is financially viable for a team
   */
  assessTransferViability(
    player: Player,
    bidAmount: number,
    contractDetails: ContractDetails,
    team: Team
  ): { viable: boolean; reason: string; projectedCost: number } {
    // Total cost = transfer fee + first year wages + signing bonus
    const firstYearWages = contractDetails.salary * 52;
    const totalCost = bidAmount + firstYearWages + (contractDetails.signingBonus || 0);

    // Check if team can afford (should leave at least 20% of budget)
    const remainingBudget = team.budget - totalCost;
    const minRequiredBuffer = team.budget * 0.2;

    if (remainingBudget < minRequiredBuffer) {
      return {
        viable: false,
        reason: `Transfer would leave insufficient budget buffer (€${remainingBudget} < €${minRequiredBuffer})`,
        projectedCost: totalCost,
      };
    }

    // Check wage impact
    const currentWageBill = this.estimateCurrentWageBill(team);
    const newWageBill = currentWageBill + contractDetails.salary;
    const wageToBudgetRatio = newWageBill / (team.budget * 0.6); // wage bill should be ~60% of budget max

    if (wageToBudgetRatio > 1.2) {
      return {
        viable: false,
        reason: `Wage bill would exceed sustainable levels (${(wageToBudgetRatio * 100).toFixed(1)}% of budget)`,
        projectedCost: totalCost,
      };
    }

    return {
      viable: true,
      reason: 'Transfer is financially viable',
      projectedCost: totalCost,
    };
  }

  /**
   * Estimate current wage bill for a team
   */
  private estimateCurrentWageBill(team: Team): number {
    // This would need player data - return placeholder
    // In real implementation, would sum all player contracts
    return team.budget * 0.4; // Assume 40% of budget currently on wages
  }

  /**
   * Calculate realistic negotiation deadline
   */
  getNegotiationDeadline(): string {
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 2); // 2 days to negotiate
    return deadline.toISOString();
  }

  /**
   * Check if negotiation has timed out
   */
  hasNegotiationTimedOut(createdAt: string): boolean {
    const created = new Date(createdAt);
    const now = new Date();
    return now.getTime() - created.getTime() > this.negotiationTimeout;
  }
}

/**
 * Factory function
 */
export function createNegotiator(negotiationTimeout?: number, maxRounds?: number): Negotiator {
  return new Negotiator(negotiationTimeout, maxRounds);
}
