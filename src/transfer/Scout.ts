import { Player, Team } from '../models';
import { ScoutReport } from './types';

/**
 * Scout class generates scouting reports for players
 * Provides evaluation metrics and recommendations
 */
export class Scout {
  private readonly id: string;
  private readonly name: string;
  private readonly regionExpertise: string;
  private readonly knowledgeLevel: number; // 0-1 scale

  constructor(id: string, name: string, regionExpertise: string, knowledgeLevel: number = 0.8) {
    this.id = id;
    this.name = name;
    this.regionExpertise = regionExpertise;
    this.knowledgeLevel = Math.max(0, Math.min(1, knowledgeLevel));
  }

  /**
   * Scout a player and generate a report
   */
  scoutPlayer(player: Player, team: Team): ScoutReport {
    const rating = this.evaluatePlayer(player);
    const potential = this.evaluatePotential(player);
    const projectedCeiling = this.projectCeiling(player, potential);

    const { strengths, weaknesses } = this.analyzeStrengthsWeaknesses(player);
    const recommendations = this.generateRecommendations(rating, potential, player);
    const confidence = this.calculateConfidence(player, team);

    return {
      playerId: player.id,
      scoutId: this.id,
      rating,
      potential,
      projectedCeiling,
      strengths,
      weaknesses,
      recommendations,
      confidence,
      scoutedDate: new Date().toISOString(),
      notes: this.generateNotes(player, rating, potential),
    };
  }

  /**
   * Evaluate a player's current ability
   */
  private evaluatePlayer(player: Player): number {
    // Base rating from player's current rating with some variance based on scout knowledge
    const baseRating = player.currentRating;
    const variance = (Math.random() - 0.5) * 10 * (1 - this.knowledgeLevel);
    let evaluatedRating = baseRating + variance;

    // Region expertise bonus/penalty
    if (player.nationality !== this.regionExpertise) {
      evaluatedRating -= 5; // Slight penalty for unfamiliar region
    }

    return Math.max(0, Math.min(100, Math.round(evaluatedRating)));
  }

  /**
   * Evaluate a player's potential
   */
  private evaluatePotential(player: Player): number {
    const age = this.calculateAge(player.dateOfBirth);
    const currentRating = player.currentRating;

    // Potential depends on age and current level
    let potential: number;

    if (age < 20) {
      // Young players have higher potential ceiling
      potential = currentRating + (30 - age) * 2;
    } else if (age < 25) {
      potential = currentRating + (28 - age) * 1.5;
    } else if (age < 30) {
      potential = currentRating + (30 - age);
    } else {
      // Older players have limited potential
      potential = currentRating - 1;
    }

    // Add some scouting variance
    const variance = (Math.random() - 0.5) * 10 * (1 - this.knowledgeLevel);
    potential += variance;

    return Math.max(0, Math.min(110, Math.round(potential)));
  }

  /**
   * Project player's maximum ceiling
   */
  private projectCeiling(player: Player, potential: number): number {
    const age = this.calculateAge(player.dateOfBirth);
    const currentRating = player.currentRating;

    // Ceiling is the absolute maximum this player could reach
    let ceiling = potential + 5;

    // Younger players have higher ceilings
    if (age < 18) ceiling += 10;
    else if (age < 21) ceiling += 5;

    // Position-based adjustments
    const positionCeiling = this.getPositionCeiling(player.position);
    ceiling = Math.min(ceiling, positionCeiling);

    return Math.min(110, Math.round(ceiling));
  }

  /**
   * Get theoretical ceiling for a position
   */
  private getPositionCeiling(position: string): number {
    // Goalkeepers peak later, outfield positions slightly lower max
    const positionCeilings: Record<string, number> = {
      goalkeeper: 95,
      'center-back': 90,
      'right-back': 88,
      'left-back': 88,
      'defensive-midfielder': 92,
      'central-midfielder': 90,
      'attacking-midfielder': 92,
      'right-winger': 90,
      'left-winger': 90,
      striker: 93,
    };
    return positionCeilings[position] || 90;
  }

  /**
   * Analyze player strengths and weaknesses
   */
  private analyzeStrengthsWeaknesses(player: Player): {
    strengths: string[];
    weaknesses: string[];
  } {
    const stats = player.stats;
    const rating = player.currentRating;
    const position = player.position;

    const strengths: string[] = [];
    const weaknesses: string[] = [];

    // Position-specific analysis
    if (position === 'striker') {
      if (stats.goals > 15) strengths.push('Clinical finishing');
      if (stats.goals < 5) weaknesses.push('Poor goal conversion');
    } else if (position.includes('midfielder')) {
      if (stats.assists > 8) strengths.push('Creative playmaker');
      if (stats.assists < 2) weaknesses.push('Limited creative output');
    } else if (position.includes('back') || position === 'center-back') {
      if (player.currentRating > 75) strengths.push('Solid defender');
    }

    // General analysis based on rating
    if (rating >= 80) {
      strengths.push('Elite technical ability');
    } else if (rating < 60) {
      weaknesses.push('Technical deficiencies');
    }

    if (stats.appearances > 100) {
      strengths.push('Experienced');
    } else if (stats.appearances < 20) {
      weaknesses.push('Inexperienced');
    }

    // Always add some generic items to ensure non-empty arrays
    if (strengths.length === 0) {
      strengths.push('Technically sound');
    }
    if (weaknesses.length === 0) {
      weaknesses.push('Needs physical development');
    }

    return { strengths, weaknesses };
  }

  /**
   * Generate recommendation based on evaluation
   */
  private generateRecommendations(rating: number, potential: number, player: Player): string[] {
    const recommendations: string[] = [];
    const age = this.calculateAge(player.dateOfBirth);

    if (rating >= 80 && potential >= 85) {
      recommendations.push('sign');
      recommendations.push('immediate starter');
    } else if (rating >= 75 && potential >= 80) {
      recommendations.push('sign');
      recommendations.push('rotation player');
    } else if (rating >= 70 && potential >= 75) {
      recommendations.push('monitor');
      recommendations.push('potential development');
    } else if (age < 22 && potential >= 80) {
      recommendations.push('prospect');
      recommendations.push('loan for development');
    } else {
      recommendations.push('avoid');
    }

    return recommendations;
  }

  /**
   * Calculate confidence in scouting assessment
   */
  private calculateConfidence(player: Player, team: Team): number {
    let confidence = this.knowledgeLevel;

    // Higher confidence for players from scouting region
    if (player.nationality === this.regionExpertise) {
      confidence += 0.1;
    }

    // More appearances = higher confidence
    const appearancesFactor = Math.min(0.2, player.stats.appearances * 0.002);
    confidence += appearancesFactor;

    // Age factor - younger players have lower confidence
    const age = this.calculateAge(player.dateOfBirth);
    if (age < 20) confidence -= 0.1;
    else if (age > 30) confidence -= 0.05;

    return Math.max(0.1, Math.min(1, confidence));
  }

  /**
   * Generate scouting notes
   */
  private generateNotes(player: Player, rating: number, potential: number): string {
    const age = this.calculateAge(player.dateOfBirth);
    const improvementPotential = potential - rating;

    let notes = `Scouted on ${new Date().toISOString().split('T')[0]}. `;
    notes += `Current rating: ${rating}/100, Potential: ${potential}/100. `;
    notes += `Age: ${age}. `;

    if (improvementPotential > 10) {
      notes += 'High development potential. ';
    } else if (improvementPotential < 0) {
      notes += 'Regressing or peaked. ';
    }

    return notes;
  }

  /**
   * Calculate age from date of birth
   */
  private calculateAge(dateOfBirth: string): number {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Get scout ID
   */
  getScoutId(): string {
    return this.id;
  }

  /**
   * Get scout name
   */
  getScoutName(): string {
    return this.name;
  }

  /**
   * Get region expertise
   */
  getRegionExpertise(): string {
    return this.regionExpertise;
  }
}

/**
 * Scout Manager - manages multiple scouts and assigns scouting tasks
 */
export class ScoutManager {
  private scouts: Map<string, Scout>;
  private activeScoutingRequests: Map<number, string[]>; // playerId -> scoutIds

  constructor() {
    this.scouts = new Map();
    this.activeScoutingRequests = new Map();
  }

  /**
   * Add a scout to the system
   */
  addScout(scout: Scout): void {
    this.scouts.set(scout.getScoutId(), scout);
  }

  /**
   * Remove a scout
   */
  removeScout(scoutId: string): boolean {
    return this.scouts.delete(scoutId);
  }

  /**
   * Get all scouts
   */
  getScouts(): Scout[] {
    return Array.from(this.scouts.values());
  }

  /**
   * Get scout by ID
   */
  getScout(scoutId: string): Scout | undefined {
    return this.scouts.get(scoutId);
  }

  /**
   * Request scouting for a player
   * Returns the scout assigned or null if no scouts available
   */
  requestScouting(playerId: number): Scout | null {
    // Find best available scout (could use region matching logic here later)
    const availableScouts = this.getScouts().filter((s) => !this.isScoutBusy(s.getScoutId()));

    if (availableScouts.length === 0) {
      return null;
    }

    // For now, assign first available scout
    // Later: match scout region expertise with player nationality
    const assignedScout = availableScouts[0];

    // Track this assignment
    const currentScouts = this.activeScoutingRequests.get(playerId) || [];
    currentScouts.push(assignedScout.getScoutId());
    this.activeScoutingRequests.set(playerId, currentScouts);

    return assignedScout;
  }

  /**
   * Complete scouting request and generate report
   */
  completeScouting(playerId: number, player: Player, team: Team): ScoutReport[] {
    const scoutIds = this.activeScoutingRequests.get(playerId) || [];
    const reports: ScoutReport[] = [];

    for (const scoutId of scoutIds) {
      const scout = this.scouts.get(scoutId);
      if (scout) {
        const report = scout.scoutPlayer(player, team);
        reports.push(report);
      }
    }

    // Clear the request
    this.activeScoutingRequests.delete(playerId);

    return reports;
  }

  /**
   * Check if a scout is currently assigned to a scouting task
   */
  isScoutBusy(scoutId: string): boolean {
    for (const [_, scouts] of this.activeScoutingRequests) {
      if (scouts.includes(scoutId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get active scouting requests
   */
  getActiveRequests(): Map<number, string[]> {
    return new Map(this.activeScoutingRequests);
  }

  /**
   * Cancel a scouting request
   */
  cancelScoutingRequest(playerId: number, scoutId?: string): boolean {
    const scouts = this.activeScoutingRequests.get(playerId);
    if (!scouts) return false;

    if (scoutId) {
      const index = scouts.indexOf(scoutId);
      if (index === -1) return false;
      scouts.splice(index, 1);
    } else {
      this.activeScoutingRequests.delete(playerId);
    }

    return true;
  }
}

/**
 * Factory functions
 */
export function createScout(
  id: string,
  name: string,
  regionExpertise: string,
  knowledgeLevel?: number
): Scout {
  return new Scout(id, name, regionExpertise, knowledgeLevel);
}

export function createScoutManager(): ScoutManager {
  return new ScoutManager();
}
