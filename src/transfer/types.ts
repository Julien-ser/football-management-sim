export interface ContractDetails {
  salary: number; // weekly wage
  bonusGoals?: number; // per goal bonus
  bonusAssists?: number; // per assist bonus
  bonusCleanSheet?: number; // per clean sheet bonus for GK/defenders
  signingBonus?: number; // one-time signing bonus
  contractLength: number; // years
  startDate: string; // ISO 8601
  expiryDate: string; // ISO 8601
}

export interface ScoutReport {
  playerId: number;
  scoutId: string;
  rating: number; // 0-100
  potential: number; // 0-100
  recommendations: string[]; // e.g., ['sign', 'monitor', 'avoid']
  strengths: string[];
  weaknesses: string[];
  projectedCeiling: number; // estimated max potential
  confidence: number; // 0-1, scout confidence in assessment
  scoutedDate: string; // ISO 8601
  notes: string;
}

export interface TransferListing {
  playerId: number;
  teamId: number;
  askingPrice: number;
  minimumFee?: number; // for negotiation floor
  status: 'available' | 'negotiating' | 'sold' | 'withdrawn';
  listedDate: string;
  deadline?: string;
  preferredPositions?: string[];
  reason?: string; // why player is available (e.g., 'contract-expiring', 'rebuilding')
}

export interface Bid {
  id: string;
  playerId: number;
  buyerTeamId: number;
  sellerTeamId: number;
  amount: number;
  paymentStructure?: PaymentStructure;
  includesPlayerExchange?: boolean;
  exchangePlayers?: number[]; // player IDs going the other way
  status: 'pending' | 'accepted' | 'rejected' | 'countered' | 'withdrawn' | 'completed';
  counterBidId?: string;
  createdAt: string;
  expiresAt?: string;
  notes?: string;
}

export interface PaymentStructure {
  upfront: number;
  installments?: number; // number of installments
  installmentAmount?: number;
  addons?: Addon[];
}

export interface Addon {
  type: 'goal' | 'assist' | 'appearance' | 'clean-sheet' | 'achievement';
  trigger: number; // threshold
  amount: number; // payment amount
  maxPayout?: number; // optional cap
}

export interface SquadRegistration {
  competitionId: number;
  teamId: number;
  season: string; // e.g., "2025-2026"
  players: number[]; // player IDs
  registrationDate: string;
  deadline: string;
  maxPlayers: number;
  minGoalkeepers: number;
  minDefenders: number;
  minMidfielders: number;
  minForwards: number;
}

export interface SquadSlot {
  playerId: number;
  position: string;
  jerseyNumber: number;
  isCaptain: boolean;
  isViceCaptain: boolean;
}

export interface TransferMarketFilters {
  positions?: string[];
  maxAge?: number;
  minAge?: number;
  maxSalary?: number;
  minRating?: number;
  maxRating?: number;
  nationality?: string;
  contractExpiringWithin?: number; // months
  isAvailable?: boolean;
}

export interface TransferMarketSummary {
  totalPlayers: number;
  avgAge: number;
  avgRating: number;
  avgSalary: number;
  positions: Record<string, number>;
  totalValue: number;
}
