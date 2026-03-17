import { Tactics, PlayerInstruction } from '../models/Team';
import { TacticsPresetManager, TacticsPreset } from './TacticsPresets';
import { Player } from '../models/Player';

export interface TacticsEditorState {
  tactics: Tactics;
  playerInstructions: PlayerInstruction[];
  isValid: boolean;
  validationErrors: string[];
}

export class TacticsEditor {
  private state: TacticsEditorState;
  private presetManager: TacticsPresetManager;
  private players: Player[];

  constructor(
    players: Player[],
    initialTactics?: Tactics,
    initialInstructions?: PlayerInstruction[]
  ) {
    this.players = players;
    this.presetManager = new TacticsPresetManager();

    this.state = {
      tactics: initialTactics || {
        formation: '4-4-2',
        mentality: 'balanced',
        pressingIntensity: 'medium',
        passingStyle: 'mixed',
        width: 'balanced',
        defensiveLine: 'medium',
        playerInstructions: initialInstructions || [],
      },
      playerInstructions: initialInstructions || [],
      isValid: true,
      validationErrors: [],
    };
  }

  /**
   * Get current tactics state
   */
  getState(): TacticsEditorState {
    return { ...this.state };
  }

  /**
   * Get current tactics
   */
  getTactics(): Tactics {
    return { ...this.state.tactics, playerInstructions: [...this.state.playerInstructions] };
  }

  /**
   * Set formation using a preset
   */
  setFormationPreset(formation: string, presetRoleOverrides?: Record<string, string>): boolean {
    const formationPreset = this.presetManager.getFormationPreset(formation);
    if (!formationPreset) {
      this.state.validationErrors = [`Invalid formation: ${formation}`];
      this.state.isValid = false;
      return false;
    }

    // Update formation
    this.state.tactics = {
      ...this.state.tactics,
      formation,
    };

    // Apply default roles from preset (for players without custom instructions)
    const roles = presetRoleOverrides || formationPreset.defaultRoles;
    this.applyDefaultRolesFromFormation(roles);

    this.validate();
    return true;
  }

  /**
   * Set basic tactical parameters
   */
  setTactics(partial: Partial<Omit<Tactics, 'playerInstructions'>>): void {
    this.state.tactics = {
      ...this.state.tactics,
      ...partial,
    };
    this.validate();
  }

  /**
   * Set mentality
   */
  setMentality(mentality: 'defensive' | 'balanced' | 'attacking'): void {
    this.state.tactics.mentality = mentality;
    this.validate();
  }

  /**
   * Set pressing intensity
   */
  setPressingIntensity(intensity: 'low' | 'medium' | 'high'): void {
    this.state.tactics.pressingIntensity = intensity;
    this.validate();
  }

  /**
   * Set passing style
   */
  setPassingStyle(style: 'short' | 'mixed' | 'long'): void {
    this.state.tactics.passingStyle = style;
    this.validate();
  }

  /**
   * Set team width
   */
  setWidth(width: 'narrow' | 'balanced' | 'wide'): void {
    this.state.tactics.width = width;
    this.validate();
  }

  /**
   * Set defensive line
   */
  setDefensiveLine(line: 'low' | 'medium' | 'high'): void {
    this.state.tactics.defensiveLine = line;
    this.validate();
  }

  /**
   * Add or update player instruction
   */
  setPlayerInstruction(instruction: PlayerInstruction): void {
    const existingIndex = this.state.playerInstructions.findIndex(
      (i) => i.playerId === instruction.playerId
    );

    if (existingIndex >= 0) {
      this.state.playerInstructions[existingIndex] = instruction;
    } else {
      this.state.playerInstructions.push(instruction);
    }

    this.state.tactics.playerInstructions = this.state.playerInstructions;
    this.validate();
  }

  /**
   * Remove player instruction
   */
  removePlayerInstruction(playerId: number): boolean {
    const index = this.state.playerInstructions.findIndex((i) => i.playerId === playerId);
    if (index >= 0) {
      this.state.playerInstructions.splice(index, 1);
      this.state.tactics.playerInstructions = this.state.playerInstructions;
      this.validate();
      return true;
    }
    return false;
  }

  /**
   * Clear all player instructions
   */
  clearPlayerInstructions(): void {
    this.state.playerInstructions = [];
    this.state.tactics.playerInstructions = [];
    this.validate();
  }

  /**
   * Apply a tactics preset from the manager
   */
  applyPreset(presetId: string): boolean {
    const preset = this.presetManager.getPreset(presetId);
    if (!preset) {
      this.state.validationErrors = [`Invalid preset: ${presetId}`];
      this.state.isValid = false;
      return false;
    }

    this.state.tactics = {
      ...preset.tactics,
      playerInstructions: this.state.playerInstructions,
    };
    this.validate();
    return true;
  }

  /**
   * Save current tactics as a custom preset
   * Note: player instructions are NOT saved as they are specific to current squad
   */
  saveAsPreset(name: string, description?: string): TacticsPreset {
    const { playerInstructions: _playerInstructions, ...tacticsWithoutInstructions } =
      this.state.tactics;
    const preset = this.presetManager.createCustomPreset(
      name,
      tacticsWithoutInstructions,
      description
    );
    return preset;
  }

  /**
   * Get all available presets
   */
  getAvailablePresets(): TacticsPreset[] {
    return this.presetManager.getAllPresets();
  }

  /**
   * Get all formation presets
   */
  getFormationPresets() {
    return this.presetManager.getAllFormationPresets();
  }

  /**
   * Load tactics from a preset
   */
  loadFromPreset(presetId: string): boolean {
    return this.applyPreset(presetId);
  }

  /**
   * Get tactical modifiers from current tactics
   */
  getTacticalModifiers() {
    // Will need to import TacticsEngine dynamically or via injection
    // For now, return empty object - actual usage should go through TacticsEngine
    return {};
  }

  /**
   * Reset to default tactics
   */
  reset(): void {
    this.state = {
      tactics: {
        formation: '4-4-2',
        mentality: 'balanced',
        pressingIntensity: 'medium',
        passingStyle: 'mixed',
        width: 'balanced',
        defensiveLine: 'medium',
      },
      playerInstructions: [],
      isValid: true,
      validationErrors: [],
    };
  }

  /**
   * Validate current tactics configuration
   */
  private validate(): void {
    const errors: string[] = [];

    // Validate formation format
    if (!this.presetManager.validateFormation(this.state.tactics.formation)) {
      errors.push(`Invalid formation format: ${this.state.tactics.formation}`);
    }

    // Validate required fields
    if (!this.state.tactics.mentality) {
      errors.push('Mentality is required');
    }
    if (!this.state.tactics.pressingIntensity) {
      errors.push('Pressing intensity is required');
    }
    if (!this.state.tactics.passingStyle) {
      errors.push('Passing style is required');
    }

    // Validate player instructions reference existing players
    for (const instruction of this.state.playerInstructions) {
      const playerExists = this.players.some((p) => p.id === instruction.playerId);
      if (!playerExists) {
        errors.push(`Player ID ${instruction.playerId} does not exist in squad`);
      }
    }

    this.state.validationErrors = errors;
    this.state.isValid = errors.length === 0;
  }

  /**
   * Apply default roles based on formation preset
   */
  private applyDefaultRolesFromFormation(defaultRoles: Record<string, string>): void {
    // Remove role instructions that are not in the new formation
    // This prevents mismatched role assignments
    const newInstructions = this.state.playerInstructions.filter((instruction) => {
      // Keep instructions that don't specify a role (general instructions)
      if (!instruction.role) return true;

      // Check if the role is still relevant for the new formation
      // For simplicity, we'll clear role instructions if they don't match any position
      return Object.values(defaultRoles).includes(instruction.role);
    });

    this.state.playerInstructions = newInstructions;
    this.state.tactics.playerInstructions = newInstructions;
  }
}

// Factory function
export function createTacticsEditor(
  players: Player[],
  tactics?: Tactics,
  instructions?: PlayerInstruction[]
): TacticsEditor {
  return new TacticsEditor(players, tactics, instructions);
}
