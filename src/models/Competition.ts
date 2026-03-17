export interface Competition {
  id: number;
  name: string;
  type: CompetitionType;
  country: string;
  teams: number[]; // Team IDs
  season: string; // e.g., "2025-26"
  currentMatchday: number;
  format: CompetitionFormat;
  stages: CompetitionStage[];
  matches: number[]; // Match IDs
  rules: CompetitionRules;
  seasonStartDate: string; // ISO 8601
  seasonEndDate: string; // ISO 8601
  currentStage: string;
}

export type CompetitionType =
  | 'league'
  | 'cup'
  | 'champions-league'
  | 'europa-league'
  | 'conference-league';

export type CompetitionFormat =
  | 'round_robin' // Double round-robin (leagues)
  | 'single_elimination' // Knockout cup
  | 'group_stage_knockout' // European competitions
  | 'hybrid'; // Multiple phases

export interface CompetitionStage {
  id: string;
  name: string;
  type:
    | 'group_stage'
    | 'qualifying'
    | 'playoff'
    | 'round_of_16'
    | 'quarter_final'
    | 'semi_final'
    | 'final';
  order: number;
  groups?: GroupStage[];
  fixturePairs?: FixturePair[]; // For knockout stages
}

export interface GroupStage {
  groupId: string;
  teams: number[]; // Team IDs
  matches: number[]; // Match IDs
  standings: GroupStanding[];
}

export interface GroupStanding {
  teamId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface FixturePair {
  homeTeamId: number;
  awayTeamId: number;
  aggregateScore?: { home: number; away: number };
  winnerId?: number;
  nextStagePairId?: string; // Links to next round
}

export interface CompetitionRules {
  pointsPerWin: number;
  pointsPerDraw: number;
  pointsPerLoss: number;
  qualificationSpots: QualificationSpot[];
  relegationSpots: number;
  promotionSpots?: number; // For lower divisions
  tiebreakers: Tiebreaker[];
  aggregateLegs: number; // 1 or 2 for knockout ties
  awayGoalsRule: boolean;
  extraTime: boolean;
  penalties: boolean;
}

export interface QualificationSpot {
  position: number; // Position in table (1 = champion)
  competitionType: CompetitionType;
  competitionId?: number; // Specific competition, null means default for type
  stage: string; // e.g., 'group_stage', 'qualifying_round_3'
}

export interface Tiebreaker {
  order: number;
  criterion: 'head_to_head' | 'goal_difference' | 'goals_scored' | 'away_goals' | 'fair_play';
  descending: boolean;
}
