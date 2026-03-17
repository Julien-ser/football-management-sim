import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useGame } from '../contexts/GameContext';
import { MatchEvent as SimulationMatchEvent } from '../match/events';
import CommentaryPanel from './CommentaryPanel';
import MatchStatsPanel from './MatchStatsPanel';
import TacticalOverlay from './TacticalOverlay';
import { Player } from '../models/Player';
import { Tactics } from '../models/Team';
import { Match } from '../models/Match';
import './MatchDay.css';
import { AudioManager } from '../audio/AudioManager';
import { SoundType, AudioChannel } from '../audio/types';

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
  const [currentStats, setCurrentStats] = useState<NonNullable<Match['statistics']>>({
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
  });
  const [currentScore, setCurrentScore] = useState({ home: 0, away: 0 });
  const [substitutionPairs, setSubstitutionPairs] = useState<{
    out: number | null;
    in: number | null;
  }>({ out: null, in: null });
  const [playerPerformances, setPlayerPerformances] = useState<
    Array<{
      playerId: number;
      playerName: string;
      position: string;
      minutesPlayed: number;
      goals: number;
      assists: number;
      yellowCards: number;
      redCards: number;
      rating: number;
    }>
  >([]);

  // Filter players for home team (assuming current team is home)
  const homePlayers = players.filter((p) => homeTeam?.players?.includes(p.id as number));
  const awayPlayers = players.filter((p) => awayTeam?.players?.includes(p.id as number));

  // Start simulation when match begins
  useEffect(() => {
    if (!isMatchInProgress || !matchSimulator) return;

    let isCancelled = false;

    const runSimulation = async () => {
      try {
        // Run simulation with 2 seconds per minute for real-time feel
        const result = await matchSimulator.simulate(2000);
        if (!isCancelled) {
          setCurrentMatch(result);
          setMatchCompleted(true);
        }
      } catch (error) {
        console.error('Match simulation error:', error);
      }
    };

    runSimulation();

    return () => {
      isCancelled = true;
    };
  }, [isMatchInProgress, matchSimulator, setCurrentMatch]);

  // Poll simulator state for real-time UI updates
  useEffect(() => {
    if (!matchSimulator || !isMatchInProgress) return;

    const pollInterval = setInterval(() => {
      setMatchMinute(matchSimulator.getCurrentMinute());
      setIsHalfTime(matchSimulator.isMatchHalfTime());
      setCurrentScore(matchSimulator.getScore());
      setCurrentStats(matchSimulator.getStatistics());
    }, 100); // Update UI every 100ms

    return () => clearInterval(pollInterval);
  }, [matchSimulator, isMatchInProgress]);

  // Detect match completion from events (as backup)
  useEffect(() => {
    if (matchEvents.length === 0) return;
    const lastEvent = matchEvents[matchEvents.length - 1];
    if ((lastEvent.type === 'full-time' || lastEvent.type === 'match-end') && matchSimulator) {
      setMatchCompleted(true);
      // Fetch player performances
      const performances = matchSimulator.getPlayerPerformance();
      setPlayerPerformances(performances);
    }
  }, [matchEvents, matchSimulator]);

  // Audio integration: play sounds for new events
  const prevEventsLengthRef = useRef(0);
  useEffect(() => {
    if (matchEvents.length > prevEventsLengthRef.current) {
      const newEvents = matchEvents.slice(prevEventsLengthRef.current);
      newEvents.forEach((event) => {
        switch (event.type) {
          case 'goal':
            AudioManager.play(SoundType.GOAL_HORN, AudioChannel.SFX);
            setTimeout(() => AudioManager.play(SoundType.GOAL, AudioChannel.SFX), 200);
            break;
          case 'yellow-card':
            AudioManager.play(SoundType.CARD, AudioChannel.SFX);
            break;
          case 'red-card':
            AudioManager.play(SoundType.CARD, AudioChannel.SFX);
            break;
          case 'match-start':
            AudioManager.play(SoundType.KICK_OFF, AudioChannel.SFX);
            break;
          case 'half-time':
            AudioManager.play(SoundType.HALF_TIME, AudioChannel.SFX);
            break;
          case 'full-time':
            AudioManager.play(SoundType.FULL_TIME, AudioChannel.SFX);
            break;
          case 'substitution':
            AudioManager.play(SoundType.UI_CLICK, AudioChannel.SFX);
            break;
          default:
            if (event.type === 'foul' || event.type === 'corner') {
              AudioManager.play(SoundType.WHISTLE, AudioChannel.SFX);
            }
        }
      });
    }
    prevEventsLengthRef.current = matchEvents.length;
  }, [matchEvents]);

  // Background music during match
  useEffect(() => {
    if (isMatchInProgress) {
      AudioManager.playBackgroundMusic();
    } else {
      AudioManager.stopBackgroundMusic();
    }
  }, [isMatchInProgress]);

  const handleTacticsChange = useCallback(
    (team: 'home' | 'away', tactics: Partial<Tactics>) => {
      updateMatchTactics(team, tactics);
      setShowTacticalOverlay(false);
    },
    [updateMatchTactics]
  );

  const handleSubstitution = useCallback(
    (playerOutId: number, playerInId: number) => {
      if (!matchSimulator) return;

      const success = matchSimulator.substitute('home', playerOutId, playerInId);
      if (success) {
        console.log(`Substitution successful: ${playerOutId} out, ${playerInId} in`);
        setSubstitutionPairs({ out: null, in: null });
      } else {
        console.error('Substitution failed - check player availability or substitution limits');
        alert('Substitution failed. Check player availability or substitution limits.');
      }
    },
    [matchSimulator]
  );

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
    if (currentStats.possession.home > 55) {
      report += `${homeTeam?.name} controlled the game with ${currentStats.possession.home}% possession. `;
    } else if (currentStats.possession.away > 55) {
      report += `${awayTeam?.name} dominated possession with ${currentStats.possession.away}%. `;
    }

    // Add shooting analysis
    if (currentStats.shotsOnTarget.home > 5) {
      report += `${homeTeam?.name} was clinical in front of goal with ${currentStats.shotsOnTarget.home} shots on target. `;
    }
    if (currentStats.shotsOnTarget.away > 5) {
      report += `${awayTeam?.name} created numerous chances with ${currentStats.shotsOnTarget.away} shots on target. `;
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
            stats={currentStats}
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
              Possession: {currentStats.possession.home}% - {currentStats.possession.away}% | Shots:{' '}
              {currentStats.shots.home} - {currentStats.shots.away} | Shots on Target:{' '}
              {currentStats.shotsOnTarget.home} - {currentStats.shotsOnTarget.away}
            </p>
          </div>

          {playerPerformances.length > 0 && (
            <div className="match-report-section">
              <h3>👥 Player Ratings</h3>
              <div className="player-ratings-container">
                <h4>{homeTeam.name}</h4>
                <table className="player-ratings-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Min</th>
                      <th>G/A</th>
                      <th>Cards</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerPerformances
                      .filter((p) => homePlayers.some((hp) => hp.id === p.playerId))
                      .sort((a, b) => b.rating - a.rating)
                      .map((perf) => (
                        <tr key={perf.playerId}>
                          <td>{perf.playerName}</td>
                          <td>{perf.position}</td>
                          <td>{perf.minutesPlayed}'</td>
                          <td>
                            {perf.goals}/{perf.assists}
                          </td>
                          <td>
                            {perf.yellowCards > 0 && '🟨'}
                            {perf.redCards > 0 && '🟥'}
                          </td>
                          <td>
                            <span
                              className={`rating-badge ${perf.rating >= 7 ? 'rating-excellent' : perf.rating >= 5 ? 'rating-average' : 'rating-poor'}`}
                            >
                              {perf.rating.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>

                <h4>{awayTeam.name}</h4>
                <table className="player-ratings-table">
                  <thead>
                    <tr>
                      <th>Player</th>
                      <th>Position</th>
                      <th>Min</th>
                      <th>G/A</th>
                      <th>Cards</th>
                      <th>Rating</th>
                    </tr>
                  </thead>
                  <tbody>
                    {playerPerformances
                      .filter((p) => awayPlayers.some((ap) => ap.id === p.playerId))
                      .sort((a, b) => b.rating - a.rating)
                      .map((perf) => (
                        <tr key={perf.playerId}>
                          <td>{perf.playerName}</td>
                          <td>{perf.position}</td>
                          <td>{perf.minutesPlayed}'</td>
                          <td>
                            {perf.goals}/{perf.assists}
                          </td>
                          <td>
                            {perf.yellowCards > 0 && '🟨'}
                            {perf.redCards > 0 && '🟥'}
                          </td>
                          <td>
                            <span
                              className={`rating-badge ${perf.rating >= 7 ? 'rating-excellent' : perf.rating >= 5 ? 'rating-average' : 'rating-poor'}`}
                            >
                              {perf.rating.toFixed(1)}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MatchDayContainer;
