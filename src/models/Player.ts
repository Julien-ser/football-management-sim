export interface Player {
  id: number;
  name: string;
  nationality: string;
  dateOfBirth: string; // ISO 8601 date
  position: Position;
  currentRating: number; // 0-100
  potential: number; // 0-100
  contract: {
    teamId: number;
    salary: number; // weekly wage
    expiryDate: string; // ISO 8601 date
  };
  stats: {
    goals: number;
    assists: number;
    appearances: number;
    minutesPlayed: number;
  };
}

export type Position =
  | 'goalkeeper'
  | 'right-back'
  | 'left-back'
  | 'center-back'
  | 'defensive-midfielder'
  | 'central-midfielder'
  | 'attacking-midfielder'
  | 'right-winger'
  | 'left-winger'
  | 'striker';
