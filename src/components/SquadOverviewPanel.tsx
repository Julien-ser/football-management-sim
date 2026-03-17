import React from 'react';
import { useGame } from '../contexts/GameContext';

const SquadOverviewPanel: React.FC = () => {
  const { currentTeam, players } = useGame();

  if (!currentTeam) {
    return (
      <div className="panel squad-panel">
        <h2>👥 Squad</h2>
        <p>No team selected</p>
      </div>
    );
  }

  const squadPlayers = players.filter((p) => currentTeam.players.includes(p.id));

  const getPositionIcon = (position: string): string => {
    const iconMap: Record<string, string> = {
      goalkeeper: '🧤',
      'right-back': '🛡️',
      'left-back': '🛡️',
      'center-back': '🛡️',
      'defensive-midfielder': '⚙️',
      'central-midfielder': '⚙️',
      'attacking-midfielder': '⚙️',
      'right-winger': '⚡',
      'left-winger': '⚡',
      striker: '⚽',
    };
    return iconMap[position] || '👤';
  };

  const getPositionShort = (position: string): string => {
    const positionMap: Record<string, string> = {
      goalkeeper: 'GK',
      'right-back': 'RB',
      'left-back': 'LB',
      'center-back': 'CB',
      'defensive-midfielder': 'DM',
      'central-midfielder': 'CM',
      'attacking-midfielder': 'AM',
      'right-winger': 'RW',
      'left-winger': 'LW',
      striker: 'ST',
    };
    return positionMap[position] || position;
  };

  return (
    <div className="panel squad-panel">
      <h2>👥 Squad - {currentTeam.name}</h2>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Pos</th>
              <th>⭐ Rating</th>
              <th>Age</th>
              <th>Wage</th>
            </tr>
          </thead>
          <tbody>
            {squadPlayers
              .sort((a, b) => b.currentRating - a.currentRating)
              .map((player) => {
                const age = new Date().getFullYear() - new Date(player.dateOfBirth).getFullYear();
                return (
                  <tr key={player.id}>
                    <td>{player.name}</td>
                    <td>
                      <span className="position-icon">{getPositionIcon(player.position)}</span>
                      {getPositionShort(player.position)}
                    </td>
                    <td>
                      <strong>{player.currentRating}</strong>
                    </td>
                    <td>{age}</td>
                    <td>€{(player.contract.salary / 1000).toFixed(0)}k</td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SquadOverviewPanel;
