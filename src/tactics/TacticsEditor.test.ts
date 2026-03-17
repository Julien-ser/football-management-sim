import { TacticsEditor } from './TacticsEditor';
import { Player } from '../models/Player';
import { Team } from '../models/Team';
import { TacticsPresetManager } from './TacticsPresets';

describe('TacticsEditor', () => {
  let players: Player[];
  let tacticsEditor: TacticsEditor;

  beforeEach(() => {
    // Create sample players
    players = [
      {
        id: 1,
        name: 'GK Player',
        position: 'goalkeeper',
        currentRating: 75,
        potential: 80,
        nationality: 'England',
        dateOfBirth: '1990-01-01',
        contract: { expiresAt: '2025-12-31', wage: 50000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 2,
        name: 'Defender 1',
        position: 'center-back',
        currentRating: 80,
        potential: 85,
        nationality: 'England',
        dateOfBirth: '1992-01-01',
        contract: { expiresAt: '2025-12-31', wage: 60000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 3,
        name: 'Defender 2',
        position: 'center-back',
        currentRating: 78,
        potential: 82,
        nationality: 'England',
        dateOfBirth: '1993-01-01',
        contract: { expiresAt: '2025-12-31', wage: 55000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 4,
        name: 'Midfielder 1',
        position: 'central-midfielder',
        currentRating: 82,
        potential: 88,
        nationality: 'England',
        dateOfBirth: '1995-01-01',
        contract: { expiresAt: '2025-12-31', wage: 70000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 5,
        name: 'Midfielder 2',
        position: 'attacking-midfielder',
        currentRating: 85,
        potential: 90,
        nationality: 'England',
        dateOfBirth: '1994-01-01',
        contract: { expiresAt: '2025-12-31', wage: 75000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 6,
        name: 'Striker 1',
        position: 'striker',
        currentRating: 88,
        potential: 92,
        nationality: 'England',
        dateOfBirth: '1996-01-01',
        contract: { expiresAt: '2025-12-31', wage: 80000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 7,
        name: 'Striker 2',
        position: 'right-winger',
        currentRating: 83,
        potential: 87,
        nationality: 'England',
        dateOfBirth: '1997-01-01',
        contract: { expiresAt: '2025-12-31', wage: 65000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
      {
        id: 8,
        name: 'Striker 3',
        position: 'left-winger',
        currentRating: 82,
        potential: 86,
        nationality: 'England',
        dateOfBirth: '1998-01-01',
        contract: { expiresAt: '2025-12-31', wage: 62000 },
        stats: { matches: 0, goals: 0, assists: 0 },
      },
    ];

    tacticsEditor = new TacticsEditor(players);
  });

  describe('initialization', () => {
    it('should initialize with default tactics', () => {
      const state = tacticsEditor.getState();
      expect(state.tactics.formation).toBe('4-4-2');
      expect(state.tactics.mentality).toBe('balanced');
      expect(state.tactics.pressingIntensity).toBe('medium');
      expect(state.tactics.passingStyle).toBe('mixed');
      expect(state.tactics.width).toBe('balanced');
      expect(state.tactics.defensiveLine).toBe('medium');
      expect(state.playerInstructions).toEqual([]);
      expect(state.isValid).toBe(true);
      expect(state.validationErrors).toEqual([]);
    });

    it('should accept initial tactics and instructions', () => {
      const customTactics = {
        formation: '4-3-3',
        mentality: 'attacking' as const,
        pressingIntensity: 'high' as const,
        passingStyle: 'short' as const,
        width: 'wide' as const,
        defensiveLine: 'high' as const,
      };
      const instructions = [{ playerId: 6, role: 'Complete Forward' as const }];

      const editor = new TacticsEditor(players, customTactics, instructions);
      const state = editor.getState();

      expect(state.tactics.formation).toBe('4-3-3');
      expect(state.tactics.mentality).toBe('attacking');
      expect(state.playerInstructions).toHaveLength(1);
      expect(state.playerInstructions[0].playerId).toBe(6);
    });
  });

  describe('setTactics', () => {
    it('should update individual tactics parameters', () => {
      tacticsEditor.setMentality('attacking');
      tacticsEditor.setPressingIntensity('high');
      tacticsEditor.setPassingStyle('short');
      tacticsEditor.setWidth('wide');
      tacticsEditor.setDefensiveLine('high');

      const tactics = tacticsEditor.getTactics();
      expect(tactics.mentality).toBe('attacking');
      expect(tactics.pressingIntensity).toBe('high');
      expect(tactics.passingStyle).toBe('short');
      expect(tactics.width).toBe('wide');
      expect(tactics.defensiveLine).toBe('high');
    });

    it('should update formation via setFormationPreset', () => {
      const result = tacticsEditor.setFormationPreset('4-3-3');
      expect(result).toBe(true);
      expect(tacticsEditor.getState().tactics.formation).toBe('4-3-3');
    });

    it('should reject invalid formation', () => {
      const result = tacticsEditor.setFormationPreset('invalid');
      expect(result).toBe(false);
      expect(tacticsEditor.getState().isValid).toBe(false);
      expect(tacticsEditor.getState().validationErrors).toContain('Invalid formation: invalid');
    });
  });

  describe('player instructions', () => {
    it('should add player instruction', () => {
      tacticsEditor.setPlayerInstruction({
        playerId: 6,
        role: 'Complete Forward',
        duty: 'attack',
        instructions: ['pressuring', 'tackle harder'],
      });

      const instructions = tacticsEditor.getState().playerInstructions;
      expect(instructions).toHaveLength(1);
      expect(instructions[0].playerId).toBe(6);
      expect(instructions[0].role).toBe('Complete Forward');
      expect(instructions[0].duty).toBe('attack');
      expect(instructions[0].instructions).toEqual(['pressuring', 'tackle harder']);
    });

    it('should update existing player instruction', () => {
      tacticsEditor.setPlayerInstruction({ playerId: 6, role: 'Advanced Forward' });
      tacticsEditor.setPlayerInstruction({ playerId: 6, role: 'Complete Forward', duty: 'attack' });

      const instructions = tacticsEditor.getState().playerInstructions;
      expect(instructions).toHaveLength(1);
      expect(instructions[0].role).toBe('Complete Forward');
      expect(instructions[0].duty).toBe('attack');
    });

    it('should remove player instruction', () => {
      tacticsEditor.setPlayerInstruction({ playerId: 6, role: 'Complete Forward' });
      const result = tacticsEditor.removePlayerInstruction(6);
      expect(result).toBe(true);
      expect(tacticsEditor.getState().playerInstructions).toHaveLength(0);
    });

    it('should return false when removing non-existent instruction', () => {
      const result = tacticsEditor.removePlayerInstruction(999);
      expect(result).toBe(false);
    });

    it('should clear all instructions', () => {
      tacticsEditor.setPlayerInstruction({ playerId: 6, role: 'Complete Forward' });
      tacticsEditor.setPlayerInstruction({ playerId: 4, role: 'Deep Lying Playmaker' });
      tacticsEditor.clearPlayerInstructions();

      expect(tacticsEditor.getState().playerInstructions).toHaveLength(0);
    });
  });

  describe('validation', () => {
    it('should validate tactics configuration', () => {
      tacticsEditor.setFormationPreset('4-4-2');
      tacticsEditor.setMentality('balanced');
      tacticsEditor.setPressingIntensity('medium');
      tacticsEditor.setPassingStyle('mixed');

      const state = tacticsEditor.getState();
      expect(state.isValid).toBe(true);
      expect(state.validationErrors).toEqual([]);
    });

    it('should validate invalid tactics', () => {
      tacticsEditor.setFormationPreset('invalid-formation');
      const state = tacticsEditor.getState();
      expect(state.isValid).toBe(false);
      expect(state.validationErrors.some((e) => e.includes('Invalid formation'))).toBe(true);
    });

    it('should validate non-existent player in instructions', () => {
      tacticsEditor.setPlayerInstruction({ playerId: 999, role: 'Complete Forward' });
      const state = tacticsEditor.getState();
      expect(state.isValid).toBe(false);
      expect(state.validationErrors.some((e) => e.includes('does not exist'))).toBe(true);
    });
  });

  describe('presets', () => {
    it('should get all available presets', () => {
      const presets = tacticsEditor.getAvailablePresets();
      expect(presets.length).toBeGreaterThan(0);
      expect(presets.some((p) => p.id === 'possession-attacking')).toBe(true);
      expect(presets.some((p) => p.id === 'counter-attack')).toBe(true);
    });

    it('should apply preset by ID', () => {
      const result = tacticsEditor.applyPreset('gegenpressing');
      expect(result).toBe(true);

      const tactics = tacticsEditor.getTactics();
      expect(tactics.formation).toBe('4-2-3-1');
      expect(tactics.mentality).toBe('attacking');
      expect(tactics.pressingIntensity).toBe('high');
      expect(tactics.defensiveLine).toBe('high');
    });

    it('should reject invalid preset ID', () => {
      const result = tacticsEditor.applyPreset('invalid-preset');
      expect(result).toBe(false);
    });

    it('should save current tactics as custom preset', () => {
      tacticsEditor.setFormationPreset('4-3-3');
      tacticsEditor.setMentality('attacking');

      const preset = tacticsEditor.saveAsPreset('My Custom Tactics', 'Description');

      expect(preset.id).toMatch(/^custom-/);
      expect(preset.name).toBe('My Custom Tactics');
      expect(preset.description).toBe('Description');
      expect(preset.isDefault).toBe(false);
      expect(preset.tactics.formation).toBe('4-3-3');
      expect(preset.tactics.mentality).toBe('attacking');
    });

    it('should get all formation presets', () => {
      const formations = tacticsEditor.getFormationPresets();
      expect(formations.length).toBeGreaterThan(0);
      expect(formations.some((f) => f.formation === '4-4-2')).toBe(true);
      expect(formations.some((f) => f.formation === '4-3-3')).toBe(true);
    });
  });

  describe('getTacticalModifiers', () => {
    it('should return tactical modifiers (stub for now)', () => {
      const modifiers = tacticsEditor.getTacticalModifiers();
      // Currently returns empty object - actual modifiers should be obtained via TacticsEngine
      expect(modifiers).toEqual({});
    });
  });

  describe('reset', () => {
    it('should reset to default state', () => {
      tacticsEditor.setFormationPreset('4-3-3');
      tacticsEditor.setMentality('attacking');
      tacticsEditor.setPlayerInstruction({ playerId: 6, role: 'Complete Forward' });

      tacticsEditor.reset();

      const state = tacticsEditor.getState();
      expect(state.tactics.formation).toBe('4-4-2');
      expect(state.tactics.mentality).toBe('balanced');
      expect(state.playerInstructions).toHaveLength(0);
      expect(state.isValid).toBe(true);
    });
  });
});

describe('TacticsPresetManager Persistence', () => {
  const testStoragePath = '/tmp/test-tactics-presets.json';

  beforeEach(() => {
    // Clean up any existing test file
    try {
      if (require('fs').existsSync(testStoragePath)) {
        require('fs').unlinkSync(testStoragePath);
      }
    } catch {
      // ignore
    }
  });

  it('should save custom presets to file', () => {
    const manager = new TacticsPresetManager(testStoragePath);

    // Should start with default presets only
    const initialCount = manager.getAllPresets().length;

    // Create a custom preset
    const preset = manager.createCustomPreset('Test Tactics', {
      formation: '4-4-2',
      mentality: 'defensive',
      pressingIntensity: 'low',
      passingStyle: 'long',
    });

    // Check if file exists and contains the preset
    expect(require('fs').existsSync(testStoragePath)).toBe(true);

    const fileContent = require('fs').readFileSync(testStoragePath, 'utf-8');
    const savedPresets = JSON.parse(fileContent);
    expect(savedPresets.some((p: any) => p.id === preset.id)).toBe(true);

    // Clean up
    require('fs').unlinkSync(testStoragePath);
  });

  it('should load custom presets from file on construction', () => {
    // First, create some presets and save them
    const manager1 = new TacticsPresetManager(testStoragePath);
    manager1.createCustomPreset('Loaded Tactics 1', {
      formation: '4-3-3',
      mentality: 'attacking',
      pressingIntensity: 'high',
      passingStyle: 'short',
    });
    manager1.createCustomPreset('Loaded Tactics 2', {
      formation: '3-5-2',
      mentality: 'balanced',
      pressingIntensity: 'medium',
      passingStyle: 'mixed',
    });

    // Verify saved
    const fileContent = require('fs').readFileSync(testStoragePath, 'utf-8');
    const savedPresets = JSON.parse(fileContent);
    expect(savedPresets).toHaveLength(2);

    // Create new manager (should load from file)
    const manager2 = new TacticsPresetManager(testStoragePath);
    const allPresets = manager2.getAllPresets();

    // Should have defaults + loaded custom presets
    expect(allPresets.length).toBeGreaterThan(2); // defaults + 2 custom
    expect(allPresets.some((p) => p.name === 'Loaded Tactics 1')).toBe(true);
    expect(allPresets.some((p) => p.name === 'Loaded Tactics 2')).toBe(true);

    // Clean up
    require('fs').unlinkSync(testStoragePath);
  });
});
