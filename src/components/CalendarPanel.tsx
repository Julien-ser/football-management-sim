import React from 'react';
import { useGame } from '../contexts/GameContext';
import { Calendar as CalendarType } from '../competition/Calendar';

const CalendarPanel: React.FC = () => {
  const { calendar, selectedDate, setSelectedDate, currentTeam } = useGame();

  if (!calendar) {
    return (
      <div className="panel calendar-panel">
        <h2>Calendar</h2>
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
      <h2>Calendar</h2>
      {nextMatch && (
        <div className="next-match">
          <h3>Next Match</h3>
          <p>{formatDate(nextMatch.date)} - Check fixtures for details</p>
        </div>
      )}
      <div className="calendar-controls">
        <button onClick={handlePrevWeek}>&lt; Prev Week</button>
        <span>{selectedDate.toLocaleDateString()}</span>
        <button onClick={handleNextWeek}>Next Week &gt;</button>
      </div>
      <div className="upcoming-matches">
        <h3>Upcoming Matches</h3>
        <ul>
          {upcomingMatches.slice(0, 10).map((match) => (
            <li key={match.id} className={match.status}>
              <span className="date">{formatDate(match.date)}</span>
              <span className="match">
                {match.homeTeamId} vs {match.awayTeamId}
              </span>
              <span className="status">{match.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default CalendarPanel;
