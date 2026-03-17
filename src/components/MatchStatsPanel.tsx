import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Player } from '../models/Player';
import './MatchDay.css';

interface MatchStatsPanelProps {
  homeTeamName: string;
  awayTeamName: string;
  stats: {
    possession: { home: number; away: number };
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    passes: { home: number; away: number };
    passAccuracy: { home: number; away: number };
    fouls: { home: number; away: number };
    corners: { home: number; away: number };
    offsides: { home: number; away: number };
    yellowCards: { home: number; away: number };
    redCards: { home: number; away: number };
  };
  currentScore: { home: number; away: number };
  matchTime?: number; // Current minute
  isHalfTime?: boolean;
}

const MatchStatsPanel: React.FC<MatchStatsPanelProps> = ({
  homeTeamName,
  awayTeamName,
  stats,
  currentScore,
  matchTime,
  isHalfTime = false,
}) => {
  const StatBar: React.FC<{ label: string; home: number; away: number; unit?: string }> = ({
    label,
    home,
    away,
    unit = '',
  }) => {
    const total = home + away;
    const homePercent = total > 0 ? (home / total) * 100 : 50;
    const awayPercent = total > 0 ? (away / total) * 100 : 50;

    return (
      <div className="stat-row">
        <div className="stat-label">{label}</div>
        <div className="stat-bars">
          <div className="stat-bar-container">
            <div className="stat-bar home-bar" style={{ width: `${homePercent}%` }}>
              <span className="stat-value">
                {home}
                {unit}
              </span>
            </div>
          </div>
          <div className="stat-bar-container">
            <div className="stat-bar away-bar" style={{ width: `${awayPercent}%` }}>
              <span className="stat-value">
                {away}
                {unit}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="match-stats-panel">
      <div className="match-header">
        <div className="team-score home">
          <div className="team-name">{homeTeamName}</div>
          <div className="score">{currentScore.home}</div>
        </div>
        <div className="match-info">
          {matchTime !== undefined && (
            <div className="match-time">{isHalfTime ? 'HT' : `${matchTime}'`}</div>
          )}
          <div className="vs">VS</div>
        </div>
        <div className="team-score away">
          <div className="team-name">{awayTeamName}</div>
          <div className="score">{currentScore.away}</div>
        </div>
      </div>

      <div className="stats-container">
        <StatBar
          label="Possession"
          home={stats.possession.home}
          away={stats.possession.away}
          unit="%"
        />
        <StatBar label="Shots" home={stats.shots.home} away={stats.shots.away} />
        <StatBar
          label="Shots on Target"
          home={stats.shotsOnTarget.home}
          away={stats.shotsOnTarget.away}
        />
        <StatBar label="Passes" home={stats.passes.home} away={stats.passes.away} />
        <StatBar
          label="Pass Accuracy"
          home={stats.passAccuracy.home}
          away={stats.passAccuracy.away}
          unit="%"
        />
        <StatBar label="Fouls" home={stats.fouls.home} away={stats.fouls.away} />
        <StatBar label="Corners" home={stats.corners.home} away={stats.corners.away} />
        <StatBar label="Offsides" home={stats.offsides.home} away={stats.offsides.away} />
        <StatBar label="Yellow Cards" home={stats.yellowCards.home} away={stats.yellowCards.away} />
        <StatBar label="Red Cards" home={stats.redCards.home} away={stats.redCards.away} />
      </div>
    </div>
  );
};

export default MatchStatsPanel;
