import { Player } from './Player';

export interface MatchEvent {
  minute: number;
  type: EventType;
  playerId?: number; // may be null for some events
  teamId?: number;
  details: string;
}

export type EventType =
  | 'kickoff'
  | 'goal'
  | 'yellow-card'
  | 'red-card'
  | 'substitution'
  | 'injury'
  | 'penalty'
  | 'missed-penalty'
  | 'own-goal'
  | 'half-time'
  | 'full-time';

export interface Match {
  id: number;
  homeTeamId: number;
  awayTeamId: number;
  competitionId: number;
  date: string; // ISO 8601
  venue: string;
  status: MatchStatus;
  score?: {
    home: number;
    away: number;
  };
  halfTimeScore?: {
    home: number;
    away: number;
  };
  events: MatchEvent[];
  statistics?: {
    possession: { home: number; away: number }; // percentages
    shots: { home: number; away: number };
    shotsOnTarget: { home: number; away: number };
    passes: { home: number; away: number };
    passAccuracy: { home: number; away: number }; // percentage
    fouls: { home: number; away: number };
    corners: { home: number; away: number };
    offsides: { home: number; away: number };
    yellowCards: { home: number; away: number };
    redCards: { home: number; away: number };
  };
}

export type MatchStatus = 'scheduled' | 'in-progress' | 'completed' | 'postponed';
