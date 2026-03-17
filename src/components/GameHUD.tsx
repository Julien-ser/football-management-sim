import React from 'react';
import { useGame } from '../contexts/GameContext';
import LeagueTablePanel from './LeagueTablePanel';
import SquadOverviewPanel from './SquadOverviewPanel';
import FinancesPanel from './FinancesPanel';
import ClubStatusPanel from './ClubStatusPanel';
import CalendarPanel from './CalendarPanel';
import '../styles/App.css';

const GameHUD: React.FC = () => {
  const { currentTeam, setCurrentScreen } = useGame();

  if (!currentTeam) {
    return (
      <div className="loading">
        <h1>Loading...</h1>
      </div>
    );
  }

  return (
    <div className="hud-container">
      {/* Top Navigation Bar */}
      <nav className="hud-nav">
        <button className="nav-item active">🏠 Home</button>
        <button className="nav-item">⚙️ Tactics</button>
        <button className="nav-item">👥 Squad</button>
        <button className="nav-item">💰 Transfers</button>
        <button className="nav-item">🌱 Youth</button>
        <button className="nav-item">📅 Training</button>
        <button className="nav-item">🏆 Competitions</button>
        <button className="nav-item">📊 Stats</button>
      </nav>

      <header className="hud-header">
        <h1>⚽ Football Manager Simulator</h1>
        <div className="club-info">
          <span className="club-name">{currentTeam.name}</span>
          <span className="manager-name">👔 Manager: {currentTeam.manager}</span>
        </div>
      </header>

      <main className="hud-main">
        <aside className="left-panel">
          <LeagueTablePanel />
          <CalendarPanel />
        </aside>

        <section className="center-panel">
          <ClubStatusPanel team={currentTeam} />
          <div className="quick-actions">
            <button onClick={() => setCurrentScreen('saveGame')}>💾 Save Game</button>
            <button>📋 View Full Squad</button>
            <button>🎯 Set Tactics</button>
            <button>⚽ Next Match</button>
            <button>📊 Match Preview</button>
            <button>💬 Team Talk</button>
          </div>
          <SquadOverviewPanel />
        </section>

        <aside className="right-panel">
          <FinancesPanel />
        </aside>
      </main>
    </div>
  );
};

export default GameHUD;
