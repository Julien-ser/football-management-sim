import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Team, Player, Competition, Match } from '../models';
import { createBudgetManager } from '../transfer/BudgetManager';
import { LeagueTable } from '../competition/LeagueTable';
import { Calendar } from '../competition/Calendar';
import { MatchSimulator } from '../match/MatchSimulator';
import { Tactics, PlayerInstruction } from '../models/Team';
import { MatchEvent as SimulationMatchEvent } from '../match/events';
import { SaveGameStorage, SavedGame } from '../utils/SaveGameStorage';

interface GameSettings {
  graphicsQuality: 'low' | 'medium' | 'high';
  audioEnabled: boolean;
  musicVolume: number; // 0-100
  soundVolume: number; // 0-100
  autoSave: boolean;
  autoSaveInterval: number; // minutes
  matchSpeed: 'slow' | 'normal' | 'fast';
  showTooltips: boolean;
}

export type { GameSettings };

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
  // Match simulation state
  matchSimulator: MatchSimulator | null;
  setMatchSimulator: (simulator: MatchSimulator | null) => void;
  currentMatch: Match | null;
  setCurrentMatch: (match: Match | null) => void;
  isMatchInProgress: boolean;
  setIsMatchInProgress: (inProgress: boolean) => void;
  matchEvents: SimulationMatchEvent[];
  setMatchEvents: (events: SimulationMatchEvent[]) => void;
  homeTeam: Team | null;
  awayTeam: Team | null;
  setHomeTeam: (team: Team | null) => void;
  setAwayTeam: (team: Team | null) => void;
  currentTactics: Tactics;
  setCurrentTactics: (tactics: Tactics) => void;
  updateMatchTactics: (team: 'home' | 'away', tactics: Partial<Tactics>) => void;
  startMatch: (
    homeTeam: Team,
    awayTeam: Team,
    homePlayers: Player[],
    awayPlayers: Player[],
    homeTactics?: Tactics,
    awayTactics?: Tactics
  ) => void;
  endMatch: () => void;
  // Navigation state
  currentScreen: 'mainMenu' | 'clubSelection' | 'game' | 'settings' | 'loadGame' | 'saveGame';
  setCurrentScreen: (
    screen: 'mainMenu' | 'clubSelection' | 'game' | 'settings' | 'loadGame' | 'saveGame'
  ) => void;
  // Settings
  settings: GameSettings;
  updateSettings: (settings: Partial<GameSettings>) => void;
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
  // Match simulation state
  const [matchSimulator, setMatchSimulator] = useState<MatchSimulator | null>(null);
  const [currentMatch, setCurrentMatch] = useState<Match | null>(null);
  const [isMatchInProgress, setIsMatchInProgress] = useState<boolean>(false);
  const [matchEvents, setMatchEvents] = useState<SimulationMatchEvent[]>([]);
  const [homeTeam, setHomeTeam] = useState<Team | null>(null);
  const [awayTeam, setAwayTeam] = useState<Team | null>(null);
  const [currentTactics, setCurrentTactics] = useState<Tactics>({
    formation: '4-4-2',
    mentality: 'balanced',
    pressingIntensity: 'medium',
    passingStyle: 'mixed',
    width: 'balanced',
    defensiveLine: 'medium',
    playerInstructions: [],
  });

  // Navigation state
  const [currentScreen, setCurrentScreen] = useState<
    'mainMenu' | 'clubSelection' | 'game' | 'settings' | 'loadGame' | 'saveGame'
  >('mainMenu');
  const [settings, setSettings] = useState<GameSettings>({
    graphicsQuality: 'medium',
    audioEnabled: true,
    musicVolume: 80,
    soundVolume: 90,
    autoSave: true,
    autoSaveInterval: 5,
    matchSpeed: 'normal',
    showTooltips: true,
  });

  const updateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Keep a ref of the latest game state for auto-save
  const gameStateRef = React.useRef({
    currentTeam,
    teams,
    players,
    competitions,
    matches,
    calendar,
    currentTactics,
    settings,
  });

  // Update ref whenever state changes
  useEffect(() => {
    gameStateRef.current = {
      currentTeam,
      teams,
      players,
      competitions,
      matches,
      calendar,
      currentTactics,
      settings,
    };
  }, [currentTeam, teams, players, competitions, matches, calendar, currentTactics, settings]);

  // Auto-save effect
  useEffect(() => {
    if (!settings.autoSave) return;

    const intervalMs = settings.autoSaveInterval * 60 * 1000;
    const interval = setInterval(() => {
      const state = gameStateRef.current;
      const autoSaveData: Partial<SavedGame> = {
        version: '1.0.0',
        timestamp: Date.now(),
        saveName: `Auto-Save ${new Date().toLocaleTimeString()}`,
        teams: state.teams,
        players: state.players,
        competitions: state.competitions,
        matches: state.matches,
        calendar: state.calendar ?? undefined,
        currentTeamId: state.currentTeam?.id,
        settings: state.settings,
        currentTactics: state.currentTactics,
        daysPlayed: 0,
        season: '2025-26',
      };
      SaveGameStorage.autoSaveGame(autoSaveData);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [settings.autoSave, settings.autoSaveInterval]);

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

  const updateMatchTactics = (team: 'home' | 'away', tactics: Partial<Tactics>) => {
    if (matchSimulator) {
      matchSimulator.updateTactics(team, tactics);
    }
    // Update current tactics if the user is managing that team
    if (team === 'home' && currentTeam && homeTeam && currentTeam.id === homeTeam.id) {
      setCurrentTactics((prev) => ({ ...prev, ...tactics }));
    }
  };

  const startMatch = (
    home: Team,
    away: Team,
    homePlayers: Player[],
    awayPlayers: Player[],
    homeTactics?: Tactics,
    awayTactics?: Tactics
  ) => {
    const simulator = new MatchSimulator({
      homeTeam: home,
      awayTeam: away,
      homePlayers,
      awayPlayers,
      homeTactics: homeTactics || home.tactics || undefined,
      awayTactics: awayTactics || away.tactics || undefined,
    });

    // Subscribe to events using RxJS
    const subscription = simulator.getEventManager().events$.subscribe((event) => {
      setMatchEvents((prev) => [...prev, event]);
    });

    // Store subscription for cleanup
    (simulator as any)._eventSubscription = subscription;

    setMatchSimulator(simulator);
    setHomeTeam(home);
    setAwayTeam(away);
    setIsMatchInProgress(true);
    setMatchEvents([]);
  };

  const endMatch = () => {
    if (matchSimulator) {
      // Cleanup subscription
      const subscription = (matchSimulator as any)._eventSubscription;
      if (subscription) {
        subscription.unsubscribe();
      }
      matchSimulator.getEventManager().complete();
      setMatchSimulator(null);
    }
    setIsMatchInProgress(false);
    setCurrentMatch(null);
    setHomeTeam(null);
    setAwayTeam(null);
    setMatchEvents([]);
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
        // Match simulation state
        matchSimulator,
        setMatchSimulator,
        currentMatch,
        setCurrentMatch,
        isMatchInProgress,
        setIsMatchInProgress,
        matchEvents,
        setMatchEvents,
        homeTeam,
        setHomeTeam,
        awayTeam,
        setAwayTeam,
        currentTactics,
        setCurrentTactics,
        updateMatchTactics,
        startMatch,
        endMatch,
        // Navigation
        currentScreen,
        setCurrentScreen,
        // Settings
        settings,
        updateSettings,
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
