export interface Team {
  id: number;
  name: string;
  shortName: string; // 3-letter abbreviation
  stadium: string;
  capacity: number;
  leagueId: number;
  manager: string;
  budget: number; // transfer budget in €
  players: number[]; // Player IDs
  tactics?: Tactics;
}

export interface Tactics {
  formation: string; // e.g., "4-4-2", "4-3-3"
  mentality: 'defensive' | 'balanced' | 'attacking';
  pressingIntensity: 'low' | 'medium' | 'high';
  passingStyle: 'short' | 'mixed' | 'long';
}
