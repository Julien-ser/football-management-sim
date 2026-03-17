import React from 'react';
import { useGame } from '../contexts/GameContext';
import { MatchEvent as SimulationMatchEvent } from '../match/events';
import './MatchDay.css';

interface CommentaryPanelProps {
  events: SimulationMatchEvent[];
  homeTeamName: string;
  awayTeamName: string;
}

const CommentaryPanel: React.FC<CommentaryPanelProps> = ({
  events,
  homeTeamName,
  awayTeamName,
}) => {
  const formatEventMessage = (event: SimulationMatchEvent): string => {
    const minute = event.minute;

    let icon = '⚽';
    let message = event.details;

    switch (event.type) {
      case 'goal':
        icon = '🥅';
        message = `[${minute}'] GOAL! ${event.details}`;
        break;
      case 'yellow-card':
        icon = '🟨';
        message = `[${minute}'] Yellow card: ${event.details}`;
        break;
      case 'red-card':
        icon = '🟥';
        message = `[${minute}'] Red card: ${event.details}`;
        break;
      case 'substitution':
        icon = '🔄';
        message = `[${minute}'] ${event.details}`;
        break;
      case 'injury':
        icon = '🤕';
        message = `[${minute}'] Injury: ${event.details}`;
        break;
      case 'half-time':
        icon = '⏱️';
        message = `--- HALF TIME ---`;
        break;
      case 'full-time':
        icon = '🏁';
        message = `--- FULL TIME ---`;
        break;
      case 'penalty':
        icon = '🎯';
        message = `[${minute}'] Penalty awarded`;
        break;
      case 'missed-penalty':
        icon = '❌';
        message = `[${minute}'] Penalty missed!`;
        break;
      case 'corner':
        icon = '🚩';
        message = `[${minute}'] Corner kick`;
        break;
      case 'foul':
        icon = '⚠️';
        message = `[${minute}'] Foul committed`;
        break;
      case 'match-start':
        icon = '🔔';
        message = `Match starting...`;
        break;
      default:
        icon = '📣';
    }

    return `${icon} ${message}`;
  };

  return (
    <div className="commentary-panel">
      <h3>📢 Match Commentary</h3>
      <div className="commentary-list">
        {events.length === 0 ? (
          <div className="commentary-empty">Waiting for match to start...</div>
        ) : (
          events.slice(-50).map((event, index) => (
            <div key={index} className={`commentary-event commentary-${event.type}`}>
              {formatEventMessage(event)}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default CommentaryPanel;
