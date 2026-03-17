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
  weightInjury: number;
  weightSubstitution: number;
  weightPenalty: number;
  // Minute ranges for higher/lower probability
  highIntensityStart: number; // e.g., 70 - more events in final minutes
  // Performance target
  targetMsPerGameMinute: number; // e.g., 100ms for 90 min = 9 seconds total
}

export const DEFAULT_SIMULATION_CONFIG: SimulationConfig = {
  matchDuration: 90,
  extraTimeMin: 0,
  extraTimeMax: 3,
  baseGoalProbability: 0.018, // ~1.6 goals per match average
  baseCardProbability: 0.025, // ~2.25 cards per match average
  baseInjuryProbability: 0.003, // ~0.27 injuries per match
  weightGoal: 1.0,
  weightYellowCard: 2.5,
  weightRedCard: 0.3,
  weightInjury: 0.5,
  weightSubstitution: 0.8,
  weightPenalty: 0.15,
  highIntensityStart: 70,
  targetMsPerGameMinute: 100,
};
