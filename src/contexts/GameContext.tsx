import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Team, Player, Competition, Match } from '../models';
import { createBudgetManager } from '../transfer/BudgetManager';
import { LeagueTable } from '../competition/LeagueTable';
import { Calendar } from '../competition/Calendar';

interface GameState {
  currentTeam: Team | null;
  setCurrentTeam: (team: Team | null) => void;
  teams: Team[];
  setTeams: (teams: Team[]) => void;
  players: Player[];
  setPlayers: (players: Player[]) => void;
  competitions: Competition[];
  setCompetitions: (competitions: Competition[]) => void;
  matches: Match[];
  setMatches: (matches: Match[]) => void;
  leagueTable: LeagueTable | null;
  updateLeagueTable: (competition: Competition, teamsList: Team[]) => void;
  budgetManager: ReturnType<typeof createBudgetManager> | null;
  updateBudgetManager: (team: Team) => void;
  calendar: Calendar | null;
  setCalendar: (calendar: Calendar) => void;
  selectedDate: Date;
  setSelectedDate: (date: Date) => void;
}

const GameContext = createContext<GameState | undefined>(undefined);

interface GameProviderProps {
  children: ReactNode;
}

export const GameProvider: React.FC<GameProviderProps> = ({ children }) => {
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  const [teams, setTeams] = useState<Team[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [competitions, setCompetitions] = useState<Competition[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [leagueTable, setLeagueTable] = useState<LeagueTable | null>(null);
  const [budgetManager, setBudgetManager] = useState<ReturnType<typeof createBudgetManager> | null>(
    null
  );
  const [calendar, setCalendar] = useState<Calendar | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  const updateLeagueTable = (competition: Competition, teamsList: Team[]) => {
    const table = new LeagueTable(competition, teamsList);
    const compMatches = matches.filter(
      (m) => m.competitionId === competition.id && m.status === 'completed'
    );
    compMatches.forEach((match) => table.updateFromMatch(match));
    setLeagueTable(table);
  };

  const updateBudgetManager = (team: Team) => {
    setBudgetManager(createBudgetManager(team));
  };

  return (
    <GameContext.Provider
      value={{
        currentTeam,
        setCurrentTeam,
        teams,
        setTeams,
        players,
        setPlayers,
        competitions,
        setCompetitions,
        matches,
        setMatches,
        leagueTable,
        updateLeagueTable,
        budgetManager,
        updateBudgetManager,
        calendar,
        setCalendar,
        selectedDate,
        setSelectedDate,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};

export const useGame = (): GameState => {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
};
