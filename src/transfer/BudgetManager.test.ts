import { BudgetManager } from './BudgetManager';
import { Team } from '../models';

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

describe('BudgetManager', () => {
  let team: Team;
  let budgetManager: BudgetManager;

  beforeEach(() => {
    team = createTestTeam(1, 100000000);
    budgetManager = new BudgetManager(team);
  });

  describe('Transfer Income', () => {
    it('should record transfer income and update budget', () => {
      const initialBudget = team.budget;
      budgetManager.recordTransferIncome(50000000, 101, 2);

      expect(team.budget).toBe(initialBudget + 50000000);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalIncome).toBe(50000000);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.netBalance).toBe(50000000);
    });

    it('should create transaction with correct details', () => {
      budgetManager.recordTransferIncome(50000000, 101, 2, { saleType: 'full' });

      const transactions = budgetManager.getTransactions();
      expect(transactions.length).toBe(1);
      expect(transactions[0].type).toBe('transfer_income');
      expect(transactions[0].amount).toBe(50000000);
      expect(transactions[0].relatedPlayerId).toBe(101);
      expect(transactions[0].relatedTeamId).toBe(2);
      expect(transactions[0].metadata).toEqual({ saleType: 'full' });
    });

    it('should accumulate multiple income transactions', () => {
      budgetManager.recordTransferIncome(30000000, 101, 2);
      budgetManager.recordTransferIncome(20000000, 102, 3);

      expect(team.budget).toBe(150000000); // 100M + 30M + 20M
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalIncome).toBe(50000000);
      expect(summary.transactions.length).toBe(2);
    });
  });

  describe('Transfer Expense', () => {
    it('should record transfer expense if budget sufficient', () => {
      const initialBudget = team.budget;
      const result = budgetManager.recordTransferExpense(40000000, 201, 2);

      expect(result).toBe(true);
      expect(team.budget).toBe(initialBudget - 40000000);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalExpenses).toBe(40000000);
      expect(summary.netBalance).toBe(-40000000);
    });

    it('should reject expense if budget insufficient', () => {
      team.budget = 30000000; // Low budget
      const result = budgetManager.recordTransferExpense(50000000, 201, 2);

      expect(result).toBe(false);
      expect(team.budget).toBe(30000000); // Unchanged
      expect(budgetManager.getTransactions().length).toBe(0);
    });

    it('should record expense transaction with negative amount', () => {
      budgetManager.recordTransferExpense(40000000, 201, 2);

      const transactions = budgetManager.getTransactions();
      expect(transactions[0].type).toBe('transfer_expense');
      expect(transactions[0].amount).toBe(-40000000);
    });
  });

  describe('Wage Payments', () => {
    it('should record weekly wage payment', () => {
      const salary = 50000;
      budgetManager.recordWagePayment(301, salary);

      expect(team.budget).toBe(100000000 - salary);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.wageBill).toBe(salary);
    });

    it('should accumulate wage payments over time', () => {
      budgetManager.recordWagePayment(301, 50000);
      budgetManager.recordWagePayment(302, 60000);
      budgetManager.recordWagePayment(303, 70000);

      expect(team.budget).toBe(100000000 - 180000);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.wageBill).toBe(180000);
    });

    it('should allow filtering wage transactions', () => {
      budgetManager.recordWagePayment(301, 50000);
      budgetManager.recordTransferIncome(100000000, 401, 2);

      const wageTxns = budgetManager.getTransactions('wage');
      expect(wageTxns.length).toBe(1);
      expect(wageTxns[0].type).toBe('wage');
    });
  });

  describe('Signing Bonus', () => {
    it('should record signing bonus if budget sufficient', () => {
      const bonus = 1000000;
      const result = budgetManager.recordSigningBonus(bonus, 501);

      expect(result).toBe(true);
      expect(team.budget).toBe(100000000 - bonus);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalExpenses).toBe(bonus);
    });

    it('should reject signing bonus if budget insufficient', () => {
      team.budget = 500000;
      const result = budgetManager.recordSigningBonus(1000000, 501);

      expect(result).toBe(false);
      expect(team.budget).toBe(500000);
    });
  });

  describe('Performance Bonuses', () => {
    it('should record performance bonus', () => {
      const bonus = 10000; // per goal bonus
      budgetManager.recordPerformanceBonus(601, bonus, 'goal');

      expect(team.budget).toBe(100000000 - bonus);
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalExpenses).toBe(bonus);
    });

    it('should allow filtering by player', () => {
      budgetManager.recordPerformanceBonus(601, 10000, 'goal');
      budgetManager.recordPerformanceBonus(602, 15000, 'assist');

      const playerTxns = budgetManager.getTransactionsByPlayer(601);
      expect(playerTxns.length).toBe(1);
      expect(playerTxns[0].relatedPlayerId).toBe(601);
    });
  });

  describe('Budget Summary', () => {
    it('should calculate net balance correctly', () => {
      budgetManager.recordTransferIncome(50000000, 101, 2);
      budgetManager.recordTransferExpense(20000000, 201, 2);
      budgetManager.recordWagePayment(301, 520000); // 52k weekly

      const summary = budgetManager.getBudgetSummary();
      // totalIncome = 50M, totalExpenses = 20M + 520k = 20,520,000
      expect(summary.totalIncome).toBe(50000000);
      expect(summary.totalExpenses).toBeCloseTo(20520000, 0);
      expect(summary.netBalance).toBeCloseTo(29480000, 0);
    });

    it('should reflect current transfer budget', () => {
      budgetManager.recordTransferIncome(30000000, 101, 2);
      budgetManager.recordTransferExpense(10000000, 201, 2);
      budgetManager.addBudget(5000000, 'injection');

      expect(budgetManager.getBudget()).toBe(100000000 + 30000000 - 10000000 + 5000000);
    });

    it('should return empty summary with no transactions', () => {
      const summary = budgetManager.getBudgetSummary();
      expect(summary.totalIncome).toBe(0);
      expect(summary.totalExpenses).toBe(0);
      expect(summary.netBalance).toBe(0);
      expect(summary.wageBill).toBe(0);
      expect(summary.transactions.length).toBe(0);
    });
  });

  describe('Team Reference Update', () => {
    it('should update internal team reference', () => {
      const newTeam = createTestTeam(2, 200000000);
      budgetManager.updateTeam(newTeam);
      expect(budgetManager.getBudget()).toBe(200000000);
    });
  });

  describe('Clear Transactions', () => {
    it('should clear all transaction history for testing', () => {
      budgetManager.recordTransferIncome(50000000, 101, 2);
      budgetManager.recordTransferExpense(20000000, 201, 2);
      expect(budgetManager.getTransactions().length).toBe(2);

      budgetManager.clearTransactions();
      expect(budgetManager.getTransactions().length).toBe(0);
      // Budget amount remains unchanged
      expect(team.budget).toBe(130000000);
    });
  });
});
