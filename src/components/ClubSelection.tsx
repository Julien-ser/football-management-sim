import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { Team } from '../models/Team';
import './Menu.css';

const ClubSelection: React.FC = () => {
  const { teams, setTeams, setCurrentTeam, setCurrentScreen } = useGame();
  const [selectedLeague, setSelectedLeague] = useState<string>('all');
  const [filteredTeams, setFilteredTeams] = useState<Team[]>([]);

  // Load sample teams if none exist
  useEffect(() => {
    if (teams.length === 0) {
      loadSampleTeams();
    }
  }, [teams.length]);

  const loadSampleTeams = () => {
    const sampleTeams: Team[] = [
      {
        id: 1,
        name: 'Manchester United',
        shortName: 'MUN',
        stadium: 'Old Trafford',
        capacity: 74000,
        leagueId: 1,
        manager: 'Unassigned',
        budget: 50000000,
        players: [],
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
        players: [],
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
        players: [],
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
        players: [],
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
        players: [],
        morale: 90,
        boardConfidence: 95,
      },
    ];
    // Update the context with sample teams
    setTeams(sampleTeams);
    setFilteredTeams(sampleTeams);
  };

  useEffect(() => {
    if (teams.length > 0) {
      filterTeams(teams, selectedLeague);
    }
  }, [teams, selectedLeague]);

  const filterTeams = (teamList: Team[], league: string) => {
    if (league === 'all') {
      setFilteredTeams(teamList);
    } else {
      const leagueId = parseInt(league);
      setFilteredTeams(teamList.filter((team) => team.leagueId === leagueId));
    }
  };

  const handleTeamSelect = (team: Team) => {
    setCurrentTeam(team);
    setCurrentScreen('game');
  };

  const handleBack = () => {
    setCurrentScreen('mainMenu');
  };

  const leagues = [
    { id: 1, name: 'Premier League', country: 'England' },
    { id: 2, name: 'La Liga', country: 'Spain' },
    { id: 3, name: 'Serie A', country: 'Italy' },
    { id: 4, name: 'Bundesliga', country: 'Germany' },
    { id: 5, name: 'Ligue 1', country: 'France' },
  ];

  return (
    <div className="menu-container club-selection">
      <div className="selection-content">
        <div className="selection-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>Select Your Club</h1>
          <p>Choose a team to manage</p>
        </div>

        <div className="league-filter">
          <button
            className={`filter-button ${selectedLeague === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedLeague('all')}
          >
            All Leagues
          </button>
          {leagues.map((league) => (
            <button
              key={league.id}
              className={`filter-button ${selectedLeague === league.id.toString() ? 'active' : ''}`}
              onClick={() => setSelectedLeague(league.id.toString())}
            >
              {league.name}
            </button>
          ))}
        </div>

        <div className="teams-grid">
          {filteredTeams.map((team) => (
            <div key={team.id} className="team-card" onClick={() => handleTeamSelect(team)}>
              <div className="team-card-header">
                <h3>{team.name}</h3>
                <span className="team-short">{team.shortName}</span>
              </div>
              <div className="team-card-body">
                <p className="stadium">🏟️ {team.stadium}</p>
                <p className="capacity">Capacity: {team.capacity.toLocaleString()}</p>
                <p className="manager">👔 Manager: {team.manager}</p>
                <div className="budget">
                  <span className="budget-label">Budget:</span>
                  <span className="budget-value">€{(team.budget / 1000000).toFixed(1)}M</span>
                </div>
                <div className="stats">
                  <span className="morale">😊 Morale: {team.morale}%</span>
                  <span className="confidence">📈 Board Confidence: {team.boardConfidence}%</span>
                </div>
              </div>
              <div className="team-card-footer">
                <button className="select-button">Select</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClubSelection;
