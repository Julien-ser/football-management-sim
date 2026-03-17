import React, { useState, useEffect, useCallback } from 'react';
import { useGame } from '../contexts/GameContext';
import { MatchEvent as SimulationMatchEvent } from '../match/events';
import CommentaryPanel from './CommentaryPanel';
import MatchStatsPanel from './MatchStatsPanel';
import TacticalOverlay from './TacticalOverlay';
import { Player } from '../models/Player';
import { Tactics } from '../models/Team';
import { Match } from '../models/Match';
import './MatchDay.css';

interface MatchDayContainerProps {
  onExitMatch: () => void;
}

const MatchDayContainer: React.FC<MatchDayContainerProps> = ({ onExitMatch }) => {
  const {
    matchSimulator,
    homeTeam,
    awayTeam,
    matchEvents,
    isMatchInProgress,
    currentMatch,
    updateMatchTactics,
    currentTactics,
    players,
    endMatch,
    setCurrentMatch,
  } = useGame();

  const [showTacticalOverlay, setShowTacticalOverlay] = useState(false);
  const [matchMinute, setMatchMinute] = useState(0);
  const [isHalfTime, setIsHalfTime] = useState(false);
  const [matchCompleted, setMatchCompleted] = useState(false);
  const [substitutionPairs, setSubstitutionPairs] = useState<{
    out: number | null;
    in: number | null;
  }>({ out: null, in: null });

  // Filter players for home team (assuming current team is home)
  const homePlayers = players.filter((p) => homeTeam?.players?.includes(p.id as number));
  const awayPlayers = players.filter((p) => awayTeam?.players?.includes(p.id as number));

  // Real-time match simulation loop
  useEffect(() => {
    if (!isMatchInProgress || !matchSimulator) return;

    let animationFrameId: number;
    let lastUpdateTime = Date.now();

    const simulateMatchLoop = async () => {
      const currentTime = Date.now();
      const deltaTime = currentTime - lastUpdateTime;

      // Simulate one minute every 2 seconds (30x speed)
      if (deltaTime >= 2000 && matchMinute < 90) {
        // The MatchSimulator already runs the full simulation in its simulate() method
        // But we want real-time feel, so we'll simulate minute by minute
        // For now, we'll run the full simulation and use events incrementally
        setMatchMinute((prev) => {
          const newMinute = prev + 1;
          if (newMinute === 45) {
            setIsHalfTime(true);
          }
          return newMinute;
        });
        lastUpdateTime = currentTime;
      }

      // Check if match completed
      if (matchMinute >= 90 && !matchCompleted) {
        setMatchCompleted(true);
        // Get final match result
        if (matchSimulator) {
          const result = matchSimulator['buildMatchResult']();
          setCurrentMatch(result);
        }
      }

      animationFrameId = requestAnimationFrame(simulateMatchLoop);
    };

    animationFrameId = requestAnimationFrame(simulateMatchLoop);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isMatchInProgress, matchSimulator, matchMinute, matchCompleted, setCurrentMatch]);

  // Alternatively, if we want to use the existing MatchSimulator directly:
  useEffect(() => {
    if (!isMatchInProgress || !matchSimulator) return;

    const runSimulation = async () => {
      try {
        // Run the full simulation
        const result = await matchSimulator.simulate();
        setCurrentMatch(result);
        setMatchMinute(90);
        setMatchCompleted(true);
      } catch (error) {
        console.error('Match simulation error:', error);
      }
    };

    // Small delay to allow UI to render before simulation starts
    const timer = setTimeout(() => {
      runSimulation();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isMatchInProgress, matchSimulator, setCurrentMatch]);

  const handleTacticsChange = useCallback(
    (team: 'home' | 'away', tactics: Partial<Tactics>) => {
      updateMatchTactics(team, tactics);
      setShowTacticalOverlay(false);
    },
    [updateMatchTactics]
  );

  const handleSubstitution = useCallback((playerOutId: number, playerInId: number) => {
    console.log(`Substituting player ${playerOutId} with ${playerInId}`);
    // TODO: Implement actual substitution logic in MatchSimulator
    setSubstitutionPairs({ out: null, in: null });
  }, []);

  const currentScore = currentMatch?.score || { home: 0, away: 0 };
  const stats: Match['statistics'] = currentMatch?.statistics || {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    passAccuracy: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    offsides: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
  };

  // Generate match report summary
  const generateMatchReport = () => {
    if (!currentMatch) return '';

    const homeWon = currentScore.home > currentScore.away;
    const awayWon = currentScore.away > currentScore.home;
    const isDraw = currentScore.home === currentScore.away;

    let report = '';

    if (homeWon) {
      report = `A dominant performance from ${homeTeam?.name} secured a well-deserved victory. `;
    } else if (awayWon) {
      report = `${awayTeam?.name} came out on top in an exciting encounter. `;
    } else {
      report = 'The match ended in a closely contested draw. ';
    }

    // Add stats summary
    if (stats.possession.home > 55) {
      report += `${homeTeam?.name} controlled the game with ${stats.possession.home}% possession. `;
    } else if (stats.possession.away > 55) {
      report += `${awayTeam?.name} dominated possession with ${stats.possession.away}%. `;
    }

    // Add shooting analysis
    if (stats.shotsOnTarget.home > 5) {
      report += `${homeTeam?.name} was clinical in front of goal with ${stats.shotsOnTarget.home} shots on target. `;
    }
    if (stats.shotsOnTarget.away > 5) {
      report += `${awayTeam?.name} created numerous chances with ${stats.shotsOnTarget.away} shots on target. `;
    }

    return report.trim();
  };

  if (!homeTeam || !awayTeam) {
    return (
      <div className="match-day-container">
        <div className="loading">Loading match...</div>
      </div>
    );
  }

  return (
    <div className="match-day-container">
      {/* Match Header */}
      <div className="match-header-bar">
        <h1>⚽ Match Day</h1>
        <div className="match-teams-display">
          <div className="team-badge">
            <div className="name">{homeTeam.name}</div>
            <div className="score">{currentScore.home}</div>
          </div>
          <div className="vs-display">VS</div>
          <div className="team-badge">
            <div className="name">{awayTeam.name}</div>
            <div className="score">{currentScore.away}</div>
          </div>
        </div>
        <div className="match-timer">
          {matchCompleted ? 'FT' : isHalfTime ? 'HT' : (`${matchMinute}'` as `${number}'`)}
        </div>
      </div>

      {/* Main Content */}
      <div className="match-day-main">
        <div className="match-left-panel">
          <CommentaryPanel
            events={matchEvents}
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
          />
        </div>

        <div className="match-right-panel">
          <MatchStatsPanel
            homeTeamName={homeTeam.name}
            awayTeamName={awayTeam.name}
            stats={stats}
            currentScore={currentScore}
            matchTime={matchMinute}
            isHalfTime={isHalfTime}
          />
        </div>
      </div>

      {/* Match Controls */}
      <div className="match-controls">
        <button
          className="btn-secondary"
          onClick={() => setShowTacticalOverlay(true)}
          disabled={matchCompleted}
        >
          ⚙️ Tactics
        </button>
        <button className="btn-warning" onClick={onExitMatch}>
          🏠 Exit Match
        </button>
        {matchCompleted && (
          <button className="btn-primary" onClick={onExitMatch}>
            ✅ Continue
          </button>
        )}
      </div>

      {/* Tactical Overlay */}
      {showTacticalOverlay && (
        <TacticalOverlay
          isVisible={showTacticalOverlay}
          onClose={() => setShowTacticalOverlay(false)}
          homeTeamId={homeTeam.id}
          awayTeamId={awayTeam.id}
          homePlayers={homePlayers}
          awayPlayers={awayPlayers}
          currentTactics={currentTactics}
          onTacticsChange={handleTacticsChange}
          onSubstitution={handleSubstitution}
        />
      )}

      {/* Post-Match Analysis */}
      {matchCompleted && (
        <div className="post-match-analysis">
          <div className="post-match-header">
            <h2>🏁 Match Completed</h2>
            <div className="final-score">
              {homeTeam.name} {currentScore.home} - {currentScore.away} {awayTeam.name}
            </div>
          </div>

          <div className="match-report-section">
            <h3>📊 Match Report</h3>
            <p>{generateMatchReport()}</p>
          </div>

          <div className="match-report-section">
            <h3>⭐ Key Statistics</h3>
            <p>
              Possession: {stats.possession.home}% - {stats.possession.away}% | Shots:{' '}
              {stats.shots.home} - {stats.shots.away} | Shots on Target: {stats.shotsOnTarget.home}{' '}
              - {stats.shotsOnTarget.away}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default MatchDayContainer;
