import React from 'react';
import { useGame } from '../contexts/GameContext';

const LeagueTablePanel: React.FC = () => {
  const { leagueTable, teams, currentTeam } = useGame();

  if (!leagueTable) {
    return (
      <div className="panel league-table-panel">
        <h2>🏆 League Table</h2>
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
      <h2>🏆 League Table</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Pos</th>
              <th>Club</th>
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
              const team = teams.find((t) => t.id === standing.teamId);
              const isUserTeam = currentTeam && team && team.id === currentTeam.id;
              return (
                <tr key={standing.teamId} className={isUserTeam ? 'user-team' : ''}>
                  <td>
                    <strong>{index + 1}</strong>
                  </td>
                  <td>
                    {isUserTeam && '👉 '}
                    {getTeamName(standing.teamId)}
                    {isUserTeam && ' 👈'}
                  </td>
                  <td>{standing.played}</td>
                  <td>{standing.won}</td>
                  <td>{standing.drawn}</td>
                  <td>{standing.lost}</td>
                  <td>{standing.goalsFor}</td>
                  <td>{standing.goalsAgainst}</td>
                  <td>{gd > 0 ? `+${gd}` : gd}</td>
                  <td>
                    <strong>{standing.points}</strong>
                  </td>
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
