export interface SimulationConfig {
  // Match duration in minutes (default 90)
  matchDuration: number;
  // Extra time added at end (default 0-5 minutes randomly)
  extraTimeMin: number;
  extraTimeMax: number;
  // Probability modifiers (base percentages per minute)
  baseGoalProbability: number; // ~0.02 (2% chance per minute)
  baseCardProbability: number; // ~0.03 (3% chance per minute)
  baseInjuryProbability: number; // ~0.005 (0.5% chance per minute)
  // Event weights
  weightGoal: number;
  weightYellowCard: number;
  weightRedCard: number;
  weightOwnGoal: number;
  weightInjury: number;
  weightSubstitution: number;
  weightPenalty: number;
  weightNone: number; // weight for idle minutes (no major event)
  // Minute ranges for higher/lower probability
  highIntensityStart: number; // e.g., 70 - more events in final minutes
  // Performance target
  targetMsPerGameMinute: number; // e.g., 100ms for 90 min = 9 seconds total
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  matchDuration: 90,
  extraTimeMin: 0,
  extraTimeMax: 3,
  baseGoalProbability: 0.027,
  baseCardProbability: 0.026,
  baseInjuryProbability: 0.0035,
  weightGoal: 1.0,
  weightYellowCard: 1.5,
  weightRedCard: 0.1,
  weightOwnGoal: 0.05,
  weightInjury: 1.0,
  weightSubstitution: 0.8,
  weightPenalty: 0.15,
  weightNone: 0.9,
  highIntensityStart: 70,
  targetMsPerGameMinute: 100,
};
