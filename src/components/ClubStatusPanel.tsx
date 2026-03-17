import React from 'react';
import { Team } from '../models/Team';

interface ClubStatusPanelProps {
  team: Team;
}

const ClubStatusPanel: React.FC<ClubStatusPanelProps> = ({ team }) => {
  const getMoraleColor = (morale: number = 0): string => {
    if (morale >= 80) return '#4CAF50';
    if (morale >= 60) return '#FFC107';
    return '#F44336';
  };

  const getConfidenceColor = (confidence: number = 0): string => {
    if (confidence >= 85) return '#4CAF50';
    if (confidence >= 70) return '#FFC107';
    return '#F44336';
  };

  return (
    <div className="panel club-status-panel">
      <h2>Club Status</h2>
      <div className="status-item">
        <span className="label">Morale</span>
        <div className="bar-container">
          <div
            className="bar"
            style={{
              width: `${team.morale || 0}%`,
              backgroundColor: getMoraleColor(team.morale),
            }}
          />
        </div>
        <span className="value">{team.morale || 0}%</span>
      </div>
      <div className="status-item">
        <span className="label">Board Confidence</span>
        <div className="bar-container">
          <div
            className="bar"
            style={{
              width: `${team.boardConfidence || 0}%`,
              backgroundColor: getConfidenceColor(team.boardConfidence),
            }}
          />
        </div>
        <span className="value">{team.boardConfidence || 0}%</span>
      </div>
      <div className="status-item">
        <span className="label">Stadium</span>
        <span className="value">{team.stadium}</span>
      </div>
      <div className="status-item">
        <span className="label">Capacity</span>
        <span className="value">{team.capacity.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default ClubStatusPanel;
