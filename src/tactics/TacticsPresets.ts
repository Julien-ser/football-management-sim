import { Tactics } from '../models/Team';
import * as fs from 'fs';
import * as path from 'path';

export interface FormationPreset {
  name: string;
  formation: string;
  defaultRoles: Record<string, string>; // position -> role
  suitableMentality: ('defensive' | 'balanced' | 'attacking')[];
}

export interface TacticsPreset {
  id: string;
  name: string;
  description?: string;
  tactics: Omit<Tactics, 'playerInstructions'>;
  isDefault: boolean;
}

// Common formation presets with default roles
export const FORMATION_PRESETS: FormationPreset[] = [
  {
    name: '4-4-2 Classic',
    formation: '4-4-2',
    defaultRoles: {
      GK: 'Sweeper Keeper',
      CB1: 'Central Defender',
      CB2: 'Central Defender',
      RB: 'Wing Back',
      LB: 'Wing Back',
      CM1: 'Box-to-Box Midfielder',
      CM2: 'Box-to-Box Midfielder',
      RM: 'Winger',
      LM: 'Winger',
      ST1: 'Advanced Forward',
      ST2: 'Advanced Forward',
    },
    suitableMentality: ['balanced', 'attacking'],
  },
  {
    name: '4-3-3 Attacking',
    formation: '4-3-3',
    defaultRoles: {
      GK: 'Goalkeeper',
      CB1: 'Ball Playing Defender',
      CB2: 'Ball Playing Defender',
      RB: 'Full Back',
      LB: 'Full Back',
      DM: 'Defensive Midfielder',
      CM1: 'Advanced Playmaker',
      CM2: 'Box-to-Box Midfielder',
      RW: 'Inside Forward',
      LW: 'Inside Forward',
      ST: 'Complete Forward',
    },
    suitableMentality: ['attacking'],
  },
  {
    name: '4-3-3 Defensive',
    formation: '4-3-3',
    defaultRoles: {
      GK: 'Goalkeeper',
      CB1: 'Central Defender',
      CB2: 'Central Defender',
      RB: 'Defensive Full Back',
      LB: 'Defensive Full Back',
      DM: 'Anchor Man',
      CM1: 'Deep Lying Midfielder',
      CM2: 'Defensive Midfielder',
      RW: 'Winger',
      LW: 'Winger',
      ST: 'Pressing Forward',
    },
    suitableMentality: ['defensive'],
  },
  {
    name: '3-5-2 Midfield Control',
    formation: '3-5-2',
    defaultRoles: {
      GK: 'Sweeper Keeper',
      CB1: 'Ball Playing Defender',
      CB2: 'Central Defender',
      CB3: 'Central Defender',
      RWB: 'Wing Back',
      LWB: 'Wing Back',
      DM: 'Deep Lying Playmaker',
      CM1: 'Box-to-Box Midfielder',
      CM2: 'Advanced Playmaker',
      ST1: 'Complete Forward',
      ST2: 'Advanced Forward',
    },
    suitableMentality: ['balanced', 'attacking'],
  },
  {
    name: '5-3-2 Ultra-Defensive',
    formation: '5-3-2',
    defaultRoles: {
      GK: 'Goalkeeper',
      CB1: 'Central Defender',
      CB2: 'Central Defender',
      CB3: 'Central Defender',
      RWB: 'Defensive Wing Back',
      LWB: 'Defensive Wing Back',
      DM: 'Anchor Man',
      CM1: 'Deep Lying Midfielder',
      CM2: 'Box-to-Box Midfielder',
      ST1: 'Target Man',
      ST2: 'Pressing Forward',
    },
    suitableMentality: ['defensive'],
  },
  {
    name: '4-2-3-1 Narrow',
    formation: '4-2-3-1',
    defaultRoles: {
      GK: 'Goalkeeper',
      CB1: 'Ball Playing Defender',
      CB2: 'Ball Playing Defender',
      RB: 'Full Back',
      LB: 'Full Back',
      CDM1: 'Deep Lying Playmaker',
      CDM2: 'Defensive Midfielder',
      CAM: 'Advanced Playmaker',
      LM: 'Inside Forward',
      RM: 'Inside Forward',
      ST: 'Complete Forward',
    },
    suitableMentality: ['balanced', 'attacking'],
  },
  {
    name: '4-1-4-1 Solid',
    formation: '4-1-4-1',
    defaultRoles: {
      GK: 'Goalkeeper',
      CB1: 'Central Defender',
      CB2: 'Central Defender',
      RB: 'Full Back',
      LB: 'Full Back',
      CDM: 'Anchor Man',
      CM1: 'Box-to-Box Midfielder',
      CM2: 'Box-to-Box Midfielder',
      LM: 'Winger',
      RM: 'Winger',
      ST: 'Target Man',
    },
    suitableMentality: ['defensive', 'balanced'],
  },
];

// Common tactical presets (pre-defined tactics combinations)
export const DEFAULT_TACTICS_PRESETS: TacticsPreset[] = [
  {
    id: 'possession-attacking',
    name: 'Possession Based Attack',
    description: 'High possession, short passing, attacking mindset',
    tactics: {
      formation: '4-3-3',
      mentality: 'attacking',
      pressingIntensity: 'medium',
      passingStyle: 'short',
      width: 'balanced',
      defensiveLine: 'medium',
    },
    isDefault: true,
  },
  {
    id: 'counter-attack',
    name: 'Counter Attack',
    description: 'Fast transitions, direct passing, defensive solidity',
    tactics: {
      formation: '4-4-2',
      mentality: 'defensive',
      pressingIntensity: 'low',
      passingStyle: 'long',
      width: 'wide',
      defensiveLine: 'low',
    },
    isDefault: true,
  },
  {
    id: 'gegenpressing',
    name: 'Gegenpressing',
    description: 'High intensity pressing, aggressive pressing, high defensive line',
    tactics: {
      formation: '4-2-3-1',
      mentality: 'attacking',
      pressingIntensity: 'high',
      passingStyle: 'mixed',
      width: 'wide',
      defensiveLine: 'high',
    },
    isDefault: true,
  },
  {
    id: 'park-the-bus',
    name: 'Park the Bus',
    description: 'Ultra defensive, low block, minimal risk',
    tactics: {
      formation: '5-4-1',
      mentality: 'defensive',
      pressingIntensity: 'low',
      passingStyle: 'long',
      width: 'narrow',
      defensiveLine: 'low',
    },
    isDefault: true,
  },
  {
    id: 'balanced-possession',
    name: 'Balanced Possession',
    description: 'Balanced approach with controlled buildup',
    tactics: {
      formation: '4-4-2',
      mentality: 'balanced',
      pressingIntensity: 'medium',
      passingStyle: 'mixed',
      width: 'balanced',
      defensiveLine: 'medium',
    },
    isDefault: true,
  },
];

export class TacticsPresetManager {
  private presets: Map<string, TacticsPreset> = new Map();
  private storagePath?: string;

  constructor(storagePath?: string) {
    this.storagePath = storagePath;

    // Always load default presets first
    DEFAULT_TACTICS_PRESETS.forEach((preset) => {
      this.presets.set(preset.id, preset);
    });

    // Then load from file if path provided (custom presets will be added)
    if (storagePath) {
      this.loadFromFile();
    }
  }

  private saveToFile(): void {
    if (!this.storagePath) return;

    try {
      // Only save custom (non-default) presets to file
      const customPresets = Array.from(this.presets.values()).filter((p) => !p.isDefault);
      const dir = path.dirname(this.storagePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(this.storagePath, JSON.stringify(customPresets, null, 2));
    } catch (error) {
      console.warn(`Failed to save presets to ${this.storagePath}:`, error);
    }
  }

  private loadFromFile(): void {
    if (!this.storagePath) return;

    try {
      if (fs.existsSync(this.storagePath)) {
        const fileContent = fs.readFileSync(this.storagePath, 'utf-8');
        const savedPresets: TacticsPreset[] = JSON.parse(fileContent);
        savedPresets.forEach((preset) => {
          this.presets.set(preset.id, preset);
        });
      }
    } catch (error) {
      // Silently fail on load error, will use defaults
      console.warn(`Failed to load presets from ${this.storagePath}:`, error);
    }
  }

  getAllPresets(): TacticsPreset[] {
    return Array.from(this.presets.values());
  }

  getPreset(id: string): TacticsPreset | undefined {
    return this.presets.get(id);
  }

  savePreset(preset: TacticsPreset): void {
    this.presets.set(preset.id, preset);
    this.saveToFile();
  }

  deletePreset(id: string): boolean {
    const preset = this.presets.get(id);
    if (preset && !preset.isDefault) {
      this.presets.delete(id);
      this.saveToFile();
      return true;
    }
    return false;
  }

  createCustomPreset(
    name: string,
    tactics: Omit<Tactics, 'playerInstructions'>,
    description?: string
  ): TacticsPreset {
    const id = `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const preset: TacticsPreset = {
      id,
      name,
      description,
      tactics,
      isDefault: false,
    };
    this.savePreset(preset);
    return preset;
  }

  getFormationPreset(formation: string): FormationPreset | undefined {
    return FORMATION_PRESETS.find((f) => f.formation === formation);
  }

  getAllFormationPresets(): FormationPreset[] {
    return FORMATION_PRESETS;
  }

  validateFormation(formation: string): boolean {
    // Validate formation format (e.g., "4-4-2", "4-3-3", "3-5-2")
    const parts = formation.split('-');
    if (parts.length < 3) return false;
    const numbers = parts.map(Number);
    return numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 5);
  }
}

// Singleton instance
export const tacticsPresetManager = new TacticsPresetManager();
