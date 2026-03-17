export interface Competition {
  id: number;
  name: string;
  type: CompetitionType;
  country: string;
  teams: number[]; // Team IDs
  season: string; // e.g., "2025-26"
  currentMatchday: number;
}

export type CompetitionType =
  | 'league'
  | 'cup'
  | 'champions-league'
  | 'europa-league'
  | 'conference-league';
