import { Tactics, PlayerInstruction } from '../models/Team';
import { Player } from '../models/Player';

export interface TacticalModifiers {
  // Attack modifiers (0-2 scale, 1.0 = baseline)
  attackMultiplier: number;
  shootingMultiplier: number;
  crossingMultiplier: number;

  // Defense modifiers
  defenseMultiplier: number;
  tacklingMultiplier: number;
  pressingMultiplier: number;

  // Possession/Control modifiers
  possessionMultiplier: number;
  passAccuracyMultiplier: number;
  passingRangeMultiplier: number; // short vs long

  // Team shape modifiers
  widthMultiplier: number; // narrow vs wide
  defensiveLineMultiplier: number; // low vs high line

  // Risk/foul tendency (0-2)
  foulPropensity: number;
}

export interface TacticalSuitability {
  overall: number; // 0-100 score
  formationFit: number;
  roleFit: number;
  instructions: { [playerId: number]: number }; // per-player instruction compliance
}

export interface StartingXIAssignment {
  playerId: number;
  position: string;
  role: string;
}

export class TacticsEngine {
  private tactics: Tactics;
  private players: Player[];
  private playerInstructions: PlayerInstruction[];

  constructor(tactics: Tactics, players: Player[], playerInstructions?: PlayerInstruction[]) {
    this.tactics = tactics;
    this.players = players;
    this.playerInstructions = playerInstructions || [];
  }

  /**
   * Calculate tactical modifiers based on tactics settings
   */
  calculateModifiers(): TacticalModifiers {
    const mentality = this.tactics.mentality;
    const pressing = this.tactics.pressingIntensity;
    const passing = this.tactics.passingStyle;
    const width = this.tactics.width || 'balanced';
    const defensiveLine = this.tactics.defensiveLine || 'medium';

    let attackMultiplier = 1.0;
    let defenseMultiplier = 1.0;
    let possessionMultiplier = 1.0;
    let pressingMultiplier = 1.0;
    let widthMultiplier = 1.0;
    let defensiveLineMultiplier = 1.0;
    let passAccuracyMultiplier = 1.0;
    let passingRangeMultiplier = 1.0;
    let crossingMultiplier = 1.0;
    let shootingMultiplier = 1.0;
    let tacklingMultiplier = 1.0;
    let foulPropensity = 1.0;

    // Mentality affects attack/defense balance
    switch (mentality) {
      case 'attacking':
        attackMultiplier = 1.3;
        defenseMultiplier = 0.8;
        break;
      case 'defensive':
        attackMultiplier = 0.7;
        defenseMultiplier = 1.3;
        break;
      case 'balanced':
      default:
        // baseline
        break;
    }

    // Pressing intensity
    switch (pressing) {
      case 'high':
        pressingMultiplier = 1.5;
        foulPropensity = 1.3;
        break;
      case 'low':
        pressingMultiplier = 0.6;
        foulPropensity = 0.7;
        break;
      case 'medium':
      default:
        pressingMultiplier = 1.0;
        foulPropensity = 1.0;
        break;
    }

    // Passing style
    switch (passing) {
      case 'short':
        possessionMultiplier = 1.4;
        passAccuracyMultiplier = 1.2;
        passingRangeMultiplier = 0.7; // less long balls
        crossingMultiplier = 0.6;
        break;
      case 'long':
        possessionMultiplier = 0.7;
        passAccuracyMultiplier = 0.8;
        passingRangeMultiplier = 1.5; // more long balls
        crossingMultiplier = 1.3;
        break;
      case 'mixed':
      default:
        possessionMultiplier = 1.0;
        passAccuracyMultiplier = 1.0;
        passingRangeMultiplier = 1.0;
        crossingMultiplier = 1.0;
        break;
    }

    // Width
    switch (width) {
      case 'wide':
        widthMultiplier = 1.5;
        crossingMultiplier += 0.3;
        break;
      case 'narrow':
        widthMultiplier = 0.6;
        crossingMultiplier -= 0.3;
        break;
      case 'balanced':
      default:
        widthMultiplier = 1.0;
        break;
    }

    // Defensive line
    switch (defensiveLine) {
      case 'high':
        defensiveLineMultiplier = 1.6;
        pressingMultiplier += 0.2; // high line usually pairs with pressing
        break;
      case 'low':
        defensiveLineMultiplier = 0.5;
        defenseMultiplier += 0.2; // more defensive coverage
        break;
      case 'medium':
      default:
        defensiveLineMultiplier = 1.0;
        break;
    }

    // Shooting: attack-oriented tactics increase shooting
    shootingMultiplier = attackMultiplier * (1 + (pressingMultiplier - 1) * 0.3);

    // Tackling: based on defense + pressing
    tacklingMultiplier = defenseMultiplier * pressingMultiplier;

    // Recalculate foulPropensity based on all factors
    foulPropensity = 1.0;
    if (pressing === 'high') foulPropensity = 1.3;
    if (pressing === 'low') foulPropensity = 0.7;
    if (mentality === 'attacking') foulPropensity *= 1.2;
    if (mentality === 'defensive') foulPropensity *= 0.8;

    return {
      attackMultiplier,
      shootingMultiplier,
      crossingMultiplier,
      defenseMultiplier,
      tacklingMultiplier,
      pressingMultiplier,
      possessionMultiplier,
      passAccuracyMultiplier,
      passingRangeMultiplier,
      widthMultiplier,
      defensiveLineMultiplier,
      foulPropensity,
    };
  }

  /**
   * Calculate tactical suitability for each player (0-100)
   */
  calculateSuitability(): TacticalSuitability {
    const modifiers = this.calculateModifiers();
    const playerScores: { [playerId: number]: number } = {};
    let totalScore = 0;
    let formationFitTotal = 0;
    let roleFitTotal = 0;

    // Get starting XI - will be implemented via TeamAI integration later
    const startingXI: StartingXIAssignment[] = [];

    for (const player of this.players) {
      let score = 50; // baseline
      let formationFit = 50;
      let roleFit = 50;

      // Check if player is in starting XI and fits formation
      const assignment = startingXI.find((a) => a.playerId === player.id);
      if (assignment) {
        formationFit = 80; // Selected for formation, good fit
      } else {
        formationFit = 30; // Not in starting XI
      }

      // Role fit based on position and role
      if (assignment) {
        roleFit = this.calculateRoleFit(player, assignment.position, assignment.role);
      }

      // Instruction compliance (player-specific instructions)
      const instructionScore = this.calculateInstructionCompliance(player);

      // Overall score weighted
      score = formationFit * 0.4 + roleFit * 0.4 + instructionScore * 0.2;

      playerScores[player.id] = score;
      totalScore += score;
      formationFitTotal += formationFit;
      roleFitTotal += roleFit;
    }

    const numPlayers = this.players.length;
    return {
      overall: numPlayers > 0 ? totalScore / numPlayers : 50,
      formationFit: numPlayers > 0 ? formationFitTotal / numPlayers : 50,
      roleFit: numPlayers > 0 ? roleFitTotal / numPlayers : 50,
      instructions: playerScores,
    };
  }

  private calculateRoleFit(player: Player, position: string, role: string): number {
    // Simplified role fit calculation
    let fit = 50;

    // Position match (already filtered by TeamAI, so should be good)
    fit += 30;

    // Rating influence - higher rated players fit any role better
    fit += (player.currentRating - 50) * 0.5;

    // Potential influence
    fit += (player.potential - player.currentRating) * 0.2;

    return Math.max(0, Math.min(100, fit));
  }

  private calculateInstructionCompliance(player: Player): number {
    const instructions = this.playerInstructions.filter((i) => i.playerId === player.id);
    if (instructions.length === 0) return 50; // baseline

    // For now, baseline compliance - can be enhanced with attribute checks
    return 70; // Assume compliant if instructions are set
  }

  getModifiers(): TacticalModifiers {
    return this.calculateModifiers();
  }

  getTactics(): Tactics {
    return this.tactics;
  }
}

// Helper function to create TacticsEngine from Team and players
export function createTacticsEngine(
  tactics: Tactics,
  players: Player[],
  playerInstructions?: PlayerInstruction[]
): TacticsEngine {
  return new TacticsEngine(tactics, players, playerInstructions);
}
