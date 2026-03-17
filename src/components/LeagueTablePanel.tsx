import React from 'react';
import { useGame } from '../contexts/GameContext';

const LeagueTablePanel: React.FC = () => {
  const { leagueTable, teams } = useGame();

  if (!leagueTable) {
    return (
      <div className="panel league-table-panel">
        <h2>League Table</h2>
        <p>No league data available</p>
      </div>
    );
  }

  const table = leagueTable.getTable();

  const getTeamName = (teamId: number): string => {
    const team = teams.find((t) => t.id === teamId);
    return team ? team.name : 'Unknown';
  };

  return (
    <div className="panel league-table-panel">
      <h2>League Table</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Team</th>
              <th>P</th>
              <th>W</th>
              <th>D</th>
              <th>L</th>
              <th>GF</th>
              <th>GA</th>
              <th>GD</th>
              <th>Pts</th>
            </tr>
          </thead>
          <tbody>
            {table.map((standing, index) => {
              const gd = standing.goalsFor - standing.goalsAgainst;
              return (
                <tr key={standing.teamId}>
                  <td>{index + 1}</td>
                  <td>{getTeamName(standing.teamId)}</td>
                  <td>{standing.played}</td>
                  <td>{standing.won}</td>
                  <td>{standing.drawn}</td>
                  <td>{standing.lost}</td>
                  <td>{standing.goalsFor}</td>
                  <td>{standing.goalsAgainst}</td>
                  <td>{gd}</td>
                  <td>{standing.points}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeagueTablePanel;
