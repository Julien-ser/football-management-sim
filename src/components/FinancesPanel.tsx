import React from 'react';
import { useGame } from '../contexts/GameContext';

const FinancesPanel: React.FC = () => {
  const { currentTeam, budgetManager } = useGame();

  if (!currentTeam || !budgetManager) {
    return (
      <div className="panel finances-panel">
        <h2>Finances</h2>
        <p>No financial data available</p>
      </div>
    );
  }

  const summary = budgetManager.getBudgetSummary();
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="panel finances-panel">
      <h2>Finances</h2>
      <div className="finance-summary">
        <div className="finance-item">
          <span className="label">Transfer Budget</span>
          <span className={`value ${summary.transferBudget < 0 ? 'negative' : 'positive'}`}>
            {formatCurrency(summary.transferBudget)}
          </span>
        </div>
        <div className="finance-item">
          <span className="label">Total Income</span>
          <span className="value positive">{formatCurrency(summary.totalIncome)}</span>
        </div>
        <div className="finance-item">
          <span className="label">Total Expenses</span>
          <span className="value negative">{formatCurrency(summary.totalExpenses)}</span>
        </div>
        <div className="finance-item">
          <span className="label">Net Balance</span>
          <span className={`value ${summary.netBalance >= 0 ? 'positive' : 'negative'}`}>
            {formatCurrency(summary.netBalance)}
          </span>
        </div>
        <div className="finance-item">
          <span className="label">Weekly Wage Bill</span>
          <span className="value">{formatCurrency(summary.wageBill)}</span>
        </div>
      </div>
      <div className="recent-transactions">
        <h3>Recent Transactions</h3>
        <ul>
          {summary.transactions
            .slice(-5)
            .reverse()
            .map((tx) => (
              <li key={tx.id} className={tx.amount >= 0 ? 'positive' : 'negative'}>
                <span className="desc">{tx.description}</span>
                <span className="amount">{formatCurrency(tx.amount)}</span>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default FinancesPanel;
