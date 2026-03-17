import React from 'react';
import { useGame } from './contexts/GameContext';
import { Position } from './models/Player';
import { Calendar } from './competition/Calendar';
import LeagueTablePanel from './components/LeagueTablePanel';
import SquadOverviewPanel from './components/SquadOverviewPanel';
import FinancesPanel from './components/FinancesPanel';
import ClubStatusPanel from './components/ClubStatusPanel';
import CalendarPanel from './components/CalendarPanel';
import './styles/App.css';

const App: React.FC = () => {
  const {
    currentTeam,
    teams,
    players,
    setTeams,
    setPlayers,
    setCompetitions,
    setMatches,
    setCalendar,
    setCurrentTeam,
  } = useGame();

  // Load sample data on component mount (in real app, this would come from database/save)
  React.useEffect(() => {
    loadSampleData();
  }, []);

  const loadSampleData = () => {
    // Sample teams
    const sampleTeams = [
      {
        id: 1,
        name: 'Manchester United',
        shortName: 'MUN',
        stadium: 'Old Trafford',
        capacity: 74000,
        leagueId: 1,
        manager: 'You',
        budget: 50000000,
        players: [1, 2, 3, 4, 5],
        morale: 75,
        boardConfidence: 80,
      },
      {
        id: 2,
        name: 'Liverpool',
        shortName: 'LIV',
        stadium: 'Anfield',
        capacity: 53394,
        leagueId: 1,
        manager: 'Jürgen Klopp',
        budget: 80000000,
        players: [6, 7, 8, 9, 10],
        morale: 85,
        boardConfidence: 90,
      },
      {
        id: 3,
        name: 'Arsenal',
        shortName: 'ARS',
        stadium: 'Emirates Stadium',
        capacity: 60704,
        leagueId: 1,
        manager: 'Mikel Arteta',
        budget: 60000000,
        players: [11, 12, 13, 14, 15],
        morale: 82,
        boardConfidence: 88,
      },
      {
        id: 4,
        name: 'Chelsea',
        shortName: 'CHE',
        stadium: 'Stamford Bridge',
        capacity: 40343,
        leagueId: 1,
        manager: 'Mauricio Pochettino',
        budget: 70000000,
        players: [16, 17, 18, 19, 20],
        morale: 70,
        boardConfidence: 75,
      },
      {
        id: 5,
        name: 'Manchester City',
        shortName: 'MCI',
        stadium: 'Etihad Stadium',
        capacity: 52997,
        leagueId: 1,
        manager: 'Pep Guardiola',
        budget: 100000000,
        players: [21, 22, 23, 24, 25],
        morale: 90,
        boardConfidence: 95,
      },
    ];

    // Sample players
    const samplePlayers = [
      {
        id: 1,
        name: 'David de Gea',
        nationality: 'Spain',
        dateOfBirth: '1990-11-07',
        position: 'goalkeeper' as Position,
        currentRating: 85,
        potential: 87,
        contract: { teamId: 1, salary: 350000, expiryDate: '2024-06-30' },
        stats: { goals: 0, assists: 5, appearances: 500, minutesPlayed: 45000 },
      },
      {
        id: 2,
        name: 'Bruno Fernandes',
        nationality: 'Portugal',
        dateOfBirth: '1994-09-08',
        position: 'attacking-midfielder' as Position,
        currentRating: 88,
        potential: 89,
        contract: { teamId: 1, salary: 300000, expiryDate: '2026-06-30' },
        stats: { goals: 80, assists: 60, appearances: 200, minutesPlayed: 18000 },
      },
      {
        id: 3,
        name: 'Marcus Rashford',
        nationality: 'England',
        dateOfBirth: '1997-10-31',
        position: 'striker' as Position,
        currentRating: 86,
        potential: 88,
        contract: { teamId: 1, salary: 280000, expiryDate: '2025-06-30' },
        stats: { goals: 120, assists: 40, appearances: 250, minutesPlayed: 20000 },
      },
      {
        id: 4,
        name: 'Raphaël Varane',
        nationality: 'France',
        dateOfBirth: '1993-04-12',
        position: 'center-back' as Position,
        currentRating: 87,
        potential: 88,
        contract: { teamId: 1, salary: 250000, expiryDate: '2025-06-30' },
        stats: { goals: 10, assists: 15, appearances: 150, minutesPlayed: 13500 },
      },
      {
        id: 5,
        name: 'Casemiro',
        nationality: 'Brazil',
        dateOfBirth: '1992-02-23',
        position: 'defensive-midfielder' as Position,
        currentRating: 86,
        potential: 87,
        contract: { teamId: 1, salary: 270000, expiryDate: '2025-06-30' },
        stats: { goals: 25, assists: 30, appearances: 180, minutesPlayed: 16200 },
      },
      {
        id: 6,
        name: 'Alisson',
        nationality: 'Brazil',
        dateOfBirth: '1992-10-02',
        position: 'goalkeeper' as Position,
        currentRating: 89,
        potential: 90,
        contract: { teamId: 2, salary: 320000, expiryDate: '2026-06-30' },
        stats: { goals: 0, assists: 2, appearances: 250, minutesPlayed: 22500 },
      },
      {
        id: 7,
        name: 'Virgil van Dijk',
        nationality: 'Netherlands',
        dateOfBirth: '1991-07-08',
        position: 'center-back' as Position,
        currentRating: 89,
        potential: 90,
        contract: { teamId: 2, salary: 300000, expiryDate: '2025-06-30' },
        stats: { goals: 20, assists: 10, appearances: 200, minutesPlayed: 18000 },
      },
      {
        id: 8,
        name: 'Mohamed Salah',
        nationality: 'Egypt',
        dateOfBirth: '1992-06-15',
        position: 'right-winger' as Position,
        currentRating: 90,
        potential: 91,
        contract: { teamId: 2, salary: 350000, expiryDate: '2025-06-30' },
        stats: { goals: 180, assists: 70, appearances: 250, minutesPlayed: 22000 },
      },
      {
        id: 9,
        name: 'Darwin Núñez',
        nationality: 'Uruguay',
        dateOfBirth: '1999-06-24',
        position: 'striker' as Position,
        currentRating: 85,
        potential: 88,
        contract: { teamId: 2, salary: 220000, expiryDate: '2027-06-30' },
        stats: { goals: 40, assists: 15, appearances: 80, minutesPlayed: 6400 },
      },
      {
        id: 10,
        name: 'Trent Alexander-Arnold',
        nationality: 'England',
        dateOfBirth: '1998-10-07',
        position: 'right-back' as Position,
        currentRating: 88,
        potential: 89,
        contract: { teamId: 2, salary: 260000, expiryDate: '2025-06-30' },
        stats: { goals: 15, assists: 50, appearances: 180, minutesPlayed: 16200 },
      },
    ];

    // Set initial team to first team (Manchester United)
    setTeams(sampleTeams);
    setPlayers(samplePlayers);
    setCurrentTeam(sampleTeams[0]);

    // Create and set calendar
    const calendar = new Calendar('2025-08-01', '2026-05-31');
    setCalendar(calendar);
  };

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

export default App;
