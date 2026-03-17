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
  morale?: number; // 0-100
  boardConfidence?: number; // 0-100
}

export interface Tactics {
  formation: string; // e.g., "4-4-2", "4-3-3"
  mentality: 'defensive' | 'balanced' | 'attacking';
  pressingIntensity: 'low' | 'medium' | 'high';
  passingStyle: 'short' | 'mixed' | 'long';
  width?: 'narrow' | 'balanced' | 'wide';
  defensiveLine?: 'low' | 'medium' | 'high';
  playerInstructions?: PlayerInstruction[];
}

export interface PlayerInstruction {
  playerId: number;
  role?: string; // Custom role override (e.g., 'Advanced Forward', 'Deep Lying Playmaker')
  duty?: 'support' | 'attack' | 'defense'; // Player duty/positioning
  instructions?: string[]; // e.g., ['stay wide', 'get forward', 'mark tightly']
}
