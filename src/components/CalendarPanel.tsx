import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Calendar as CalendarType } from '../competition/Calendar';

const CalendarPanel: React.FC = () => {
  const { calendar, selectedDate, setSelectedDate, currentTeam } = useGame();

  if (!calendar) {
    return (
      <div className="panel calendar-panel">
        <h2>📅 Calendar</h2>
        <p>No calendar data available</p>
      </div>
    );
  }

  const upcomingMatches = currentTeam ? calendar.getUpcomingMatches(currentTeam.id, 30) : [];

  const nextMatch = currentTeam ? calendar.getNextMatchDay(currentTeam.id) : null;

  const formatDate = (dateStr: string): string => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const getDaysUntil = (dateStr: string): number => {
    const matchDate = new Date(dateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const diffTime = matchDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePrevWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 7);
    setSelectedDate(newDate);
  };

  const handleNextWeek = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 7);
    setSelectedDate(newDate);
  };

  return (
    <div className="panel calendar-panel">
      <h2>📅 Calendar</h2>
      {nextMatch && (
        <div className="next-match">
          <h3>⚡ Next Match</h3>
          <p>
            {formatDate(nextMatch.date)} ({getDaysUntil(nextMatch.date)} days)
          </p>
        </div>
      )}
      <div className="calendar-controls">
        <button onClick={handlePrevWeek}>&lt; Prev Week</button>
        <span>{selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
        <button onClick={handleNextWeek}>Next Week &gt;</button>
      </div>
      <div className="upcoming-matches">
        <h3>📋 Next 5 Fixtures</h3>
        <ul>
          {upcomingMatches.slice(0, 5).map((match) => {
            const daysUntil = getDaysUntil(match.date);
            const isHome = match.homeTeamId === currentTeam?.id;
            const opponent =
              match.homeTeamId === currentTeam?.id ? match.awayTeamId : match.homeTeamId;
            return (
              <li key={match.id}>
                <span className="date">
                  {formatDate(match.date)}
                  {daysUntil === 0 && ' (Today!)'}
                  {daysUntil === 1 && ' (Tomorrow)'}
                  {daysUntil > 0 && ` (${daysUntil}d)`}
                </span>
                <span className="match">
                  {isHome ? '🏠 vs' : '✈️ @'} {opponent}
                </span>
                <span className="status">
                  {isHome ? (
                    <span className="badge badge-home">H</span>
                  ) : (
                    <span className="badge badge-away">A</span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default CalendarPanel;
