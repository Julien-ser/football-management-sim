import { Team } from '../models';

export interface FinancialTransaction {
  id: string;
  date: string; // ISO 8601
  type: 'transfer_income' | 'transfer_expense' | 'wage' | 'bonus' | 'signing_bonus' | 'other';
  amount: number;
  description: string;
  relatedPlayerId?: number;
  relatedTeamId?: number;
  metadata?: Record<string, any>;
}

export interface BudgetSummary {
  transferBudget: number;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  wageBill: number; // weekly wage total
  transactions: FinancialTransaction[];
}

/**
 * BudgetManager tracks team finances including transfer budget, wages, and all financial transactions
 */
export class BudgetManager {
  private team: Team;
  private transactions: FinancialTransaction[];

  constructor(team: Team) {
    this.team = team;
    this.transactions = [];
  }

  /**
   * Record transfer income (player sold)
   */
  recordTransferIncome(
    amount: number,
    playerId: number,
    buyerTeamId: number,
    metadata?: Record<string, any>
  ): void {
    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'transfer_income',
      amount,
      description: `Transfer fee received for player ${playerId}`,
      relatedPlayerId: playerId,
      relatedTeamId: buyerTeamId,
      metadata,
    };

    this.transactions.push(transaction);
    this.team.budget += amount;
  }

  /**
   * Record transfer expense (player purchased)
   */
  recordTransferExpense(
    amount: number,
    playerId: number,
    sellerTeamId: number,
    metadata?: Record<string, any>
  ): boolean {
    if (this.team.budget < amount) {
      return false; // Insufficient budget
    }

    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'transfer_expense',
      amount: -amount, // negative for expense
      description: `Transfer fee paid for player ${playerId}`,
      relatedPlayerId: playerId,
      relatedTeamId: sellerTeamId,
      metadata,
    };

    this.transactions.push(transaction);
    this.team.budget -= amount;
    return true;
  }

  /**
   * Record wage payment (weekly)
   */
  recordWagePayment(playerId: number, salary: number, metadata?: Record<string, any>): void {
    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'wage',
      amount: -salary, // negative (expense)
      description: `Weekly wage for player ${playerId}`,
      relatedPlayerId: playerId,
      metadata,
    };

    this.transactions.push(transaction);
    this.team.budget -= salary;
  }

  /**
   * Record signing bonus (one-time)
   */
  recordSigningBonus(amount: number, playerId: number, metadata?: Record<string, any>): boolean {
    if (this.team.budget < amount) {
      return false;
    }

    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'signing_bonus',
      amount: -amount,
      description: `Signing bonus for player ${playerId}`,
      relatedPlayerId: playerId,
      metadata,
    };

    this.transactions.push(transaction);
    this.team.budget -= amount;
    return true;
  }

  /**
   * Record performance bonus (goal, assist, clean sheet, etc.)
   */
  recordPerformanceBonus(
    playerId: number,
    amount: number,
    triggerType: string,
    metadata?: Record<string, any>
  ): void {
    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'bonus',
      amount: -amount,
      description: `${triggerType} bonus for player ${playerId}`,
      relatedPlayerId: playerId,
      metadata,
    };

    this.transactions.push(transaction);
    this.team.budget -= amount;
  }

  /**
   * Calculate total wage bill for all players
   */
  calculateWageBill(playerSalaries: number[]): number {
    return playerSalaries.reduce((sum, salary) => sum + salary, 0);
  }

  /**
   * Get budget summary
   */
  getBudgetSummary(playersSalaries?: number[]): BudgetSummary {
    const totalIncome = this.transactions
      .filter((t) => t.type === 'transfer_income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = this.transactions
      .filter((t) => t.type !== 'transfer_income')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const wageTransactions = this.transactions.filter((t) => t.type === 'wage');
    const wageBill = wageTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);

    return {
      transferBudget: this.team.budget,
      totalIncome,
      totalExpenses,
      netBalance: totalIncome - totalExpenses,
      wageBill,
      transactions: [...this.transactions],
    };
  }

  /**
   * Get transaction history
   */
  getTransactions(type?: FinancialTransaction['type']): FinancialTransaction[] {
    if (type) {
      return this.transactions.filter((t) => t.type === type);
    }
    return [...this.transactions];
  }

  /**
   * Get transactions by player
   */
  getTransactionsByPlayer(playerId: number): FinancialTransaction[] {
    return this.transactions.filter((t) => t.relatedPlayerId === playerId);
  }

  /**
   * Add budget (injection for testing or special cases)
   */
  addBudget(amount: number, description: string): void {
    const transaction: FinancialTransaction = {
      id: this.generateTransactionId(),
      date: new Date().toISOString(),
      type: 'other',
      amount,
      description,
    };

    this.transactions.push(transaction);
    this.team.budget += amount;
  }

  /**
   * Get current team budget
   */
  getBudget(): number {
    return this.team.budget;
  }

  /**
   * Update team reference (when team data changes)
   */
  updateTeam(team: Team): void {
    this.team = team;
  }

  /**
   * Generate unique transaction ID
   */
  private generateTransactionId(): string {
    return `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Clear all transactions (for testing)
   */
  clearTransactions(): void {
    this.transactions = [];
  }
}

/**
 * Factory function
 */
export function createBudgetManager(team: Team): BudgetManager {
  return new BudgetManager(team);
}
