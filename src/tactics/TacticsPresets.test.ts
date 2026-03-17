import { TacticsPresetManager, DEFAULT_TACTICS_PRESETS, FORMATION_PRESETS } from './TacticsPresets';
import { readFileSync, unlinkSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

describe('TacticsPresets', () => {
  const testStoragePath = '/tmp/test-tactics-presets.json';

  beforeEach(() => {
    if (existsSync(testStoragePath)) {
      unlinkSync(testStoragePath);
    }
  });

  afterEach(() => {
    if (existsSync(testStoragePath)) {
      unlinkSync(testStoragePath);
    }
  });

  describe('FORMATION_PRESETS', () => {
    it('should have at least 5 formation presets', () => {
      expect(FORMATION_PRESETS.length).toBeGreaterThanOrEqual(5);
    });

    it('each preset should have required fields', () => {
      FORMATION_PRESETS.forEach((preset) => {
        expect(preset).toHaveProperty('name');
        expect(preset).toHaveProperty('formation');
        expect(preset).toHaveProperty('defaultRoles');
        expect(preset).toHaveProperty('suitableMentality');
      });
    });

    it('formations should be valid format', () => {
      FORMATION_PRESETS.forEach((preset) => {
        const parts = preset.formation.split('-');
        expect(parts.length).toBeGreaterThanOrEqual(3);
        const numbers = parts.map(Number);
        expect(numbers.every((n) => Number.isInteger(n) && n >= 1 && n <= 5)).toBe(true);
      });
    });
  });

  describe('DEFAULT_TACTICS_PRESETS', () => {
    it('should have at least 5 default presets', () => {
      expect(DEFAULT_TACTICS_PRESETS.length).toBeGreaterThanOrEqual(5);
    });

    it('each preset should have unique id', () => {
      const ids = DEFAULT_TACTICS_PRESETS.map((p) => p.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('each preset should be marked as default', () => {
      DEFAULT_TACTICS_PRESETS.forEach((preset) => {
        expect(preset.isDefault).toBe(true);
      });
    });

    it('each preset should have complete tactics object', () => {
      DEFAULT_TACTICS_PRESETS.forEach((preset) => {
        expect(preset.tactics).toHaveProperty('formation');
        expect(preset.tactics).toHaveProperty('mentality');
        expect(preset.tactics).toHaveProperty('pressingIntensity');
        expect(preset.tactics).toHaveProperty('passingStyle');
        expect(preset.tactics).toHaveProperty('width');
        expect(preset.tactics).toHaveProperty('defensiveLine');
      });
    });
  });

  describe('TacticsPresetManager', () => {
    it('should load default presets on construction', () => {
      const manager = new TacticsPresetManager();
      const presets = manager.getAllPresets();
      expect(presets.length).toBe(DEFAULT_TACTICS_PRESETS.length);
    });

    it('should get preset by id', () => {
      const manager = new TacticsPresetManager();
      const preset = manager.getPreset('possession-attacking');
      expect(preset).toBeDefined();
      expect(preset?.name).toBe('Possession Based Attack');
    });

    it('should return undefined for non-existent preset', () => {
      const manager = new TacticsPresetManager();
      const preset = manager.getPreset('non-existent');
      expect(preset).toBeUndefined();
    });

    it('should create custom preset', () => {
      const manager = new TacticsPresetManager();
      const initialCount = manager.getAllPresets().length;

      const customPreset = manager.createCustomPreset('My Custom Tactics', {
        formation: '4-4-2',
        mentality: 'balanced',
        pressingIntensity: 'medium',
        passingStyle: 'mixed',
        width: 'balanced',
        defensiveLine: 'medium',
      });

      expect(customPreset.id).toMatch(/^custom-/);
      expect(customPreset.name).toBe('My Custom Tactics');
      expect(customPreset.isDefault).toBe(false);
      expect(manager.getAllPresets().length).toBe(initialCount + 1);
    });

    it('should save custom preset to file', () => {
      const manager = new TacticsPresetManager(testStoragePath);
      const customPreset = manager.createCustomPreset('File Save Test', {
        formation: '4-3-3',
        mentality: 'attacking',
        pressingIntensity: 'high',
        passingStyle: 'short',
      });

      expect(existsSync(testStoragePath)).toBe(true);

      const fileContent = readFileSync(testStoragePath, 'utf-8');
      const savedPresets = JSON.parse(fileContent);
      expect(savedPresets.some((p: any) => p.id === customPreset.id)).toBe(true);
    });

    it('should create directory if it does not exist (line 250)', () => {
      const nestedPath = '/tmp/nested/test-tactics-presets.json';
      const dir = '/tmp/nested';

      if (existsSync(nestedPath)) {
        unlinkSync(nestedPath);
      }
      if (existsSync(dir)) {
        require('fs').rmdirSync(dir, { recursive: true });
      }

      expect(existsSync(dir)).toBe(false);

      const manager = new TacticsPresetManager(nestedPath);
      manager.createCustomPreset('Nested Test', {
        formation: '4-4-2',
        mentality: 'defensive',
        pressingIntensity: 'low',
        passingStyle: 'long',
      });

      expect(existsSync(dir)).toBe(true);
      expect(existsSync(nestedPath)).toBe(true);

      if (existsSync(nestedPath)) {
        unlinkSync(nestedPath);
      }
      if (existsSync(dir)) {
        require('fs').rmdirSync(dir, { recursive: true });
      }
    });

    it('should handle save error gracefully (line 254)', () => {
      const invalidPath = '/root/forbidden/presets.json';
      const manager = new TacticsPresetManager(invalidPath);

      // This should not throw, just log a warning
      expect(() => {
        manager.createCustomPreset('Error Test', {
          formation: '4-4-2',
          mentality: 'balanced',
          pressingIntensity: 'medium',
          passingStyle: 'mixed',
        });
      }).not.toThrow();
    });

    it('should load custom presets from file on construction', () => {
      // Create presets with first manager
      const manager1 = new TacticsPresetManager(testStoragePath);
      manager1.createCustomPreset('Loaded 1', {
        formation: '4-3-3',
        mentality: 'attacking',
        pressingIntensity: 'high',
        passingStyle: 'short',
      });
      manager1.createCustomPreset('Loaded 2', {
        formation: '3-5-2',
        mentality: 'balanced',
        pressingIntensity: 'medium',
        passingStyle: 'mixed',
      });

      // Verify saved
      const fileContent = readFileSync(testStoragePath, 'utf-8');
      const savedPresets = JSON.parse(fileContent);
      expect(savedPresets).toHaveLength(2);

      // New manager should load them
      const manager2 = new TacticsPresetManager(testStoragePath);
      const allPresets = manager2.getAllPresets();
      expect(allPresets.some((p) => p.name === 'Loaded 1')).toBe(true);
      expect(allPresets.some((p) => p.name === 'Loaded 2')).toBe(true);
    });

    it('should handle load error gracefully (line 271)', () => {
      const invalidPath = '/root/forbidden/presets.json';
      // Should not throw
      expect(() => {
        new TacticsPresetManager(invalidPath);
      }).not.toThrow();
    });

    it('should delete custom preset', () => {
      const manager = new TacticsPresetManager(testStoragePath);
      const customPreset = manager.createCustomPreset('ToDelete', {
        formation: '4-4-2',
        mentality: 'defensive',
        pressingIntensity: 'low',
        passingStyle: 'long',
      });

      const result = manager.deletePreset(customPreset.id);
      expect(result).toBe(true);
      expect(manager.getPreset(customPreset.id)).toBeUndefined();
    });

    it('should not delete default preset (lines 289-295)', () => {
      const manager = new TacticsPresetManager();
      const result = manager.deletePreset('possession-attacking');
      expect(result).toBe(false);
      expect(manager.getPreset('possession-attacking')).toBeDefined();
    });

    it('should return false when deleting non-existent preset', () => {
      const manager = new TacticsPresetManager();
      const result = manager.deletePreset('non-existent-id');
      expect(result).toBe(false);
    });

    it('should get formation preset by formation string', () => {
      const manager = new TacticsPresetManager();
      const preset = manager.getFormationPreset('4-4-2');
      expect(preset).toBeDefined();
      expect(preset?.name).toBe('4-4-2 Classic');
    });

    it('should return undefined for unknown formation preset', () => {
      const manager = new TacticsPresetManager();
      const preset = manager.getFormationPreset('5-5-0');
      expect(preset).toBeUndefined();
    });

    it('should get all formation presets', () => {
      const manager = new TacticsPresetManager();
      const presets = manager.getAllFormationPresets();
      expect(presets.length).toBe(FORMATION_PRESETS.length);
    });

    it('should validate correct formation formats', () => {
      const manager = new TacticsPresetManager();
      expect(manager.validateFormation('4-4-2')).toBe(true);
      expect(manager.validateFormation('4-3-3')).toBe(true);
      expect(manager.validateFormation('3-5-2')).toBe(true);
      expect(manager.validateFormation('5-3-2')).toBe(true);
    });

    it('should reject invalid formation formats', () => {
      const manager = new TacticsPresetManager();
      // Too few parts
      expect(manager.validateFormation('4-4')).toBe(false);
      expect(manager.validateFormation('4')).toBe(false);
      // Non-numeric
      expect(manager.validateFormation('invalid')).toBe(false);
      expect(manager.validateFormation('four-four-two')).toBe(false);
      // Numbers out of range
      expect(manager.validateFormation('6-4-2')).toBe(false); // 6 > 5
      expect(manager.validateFormation('4-0-2')).toBe(false); // 0 < 1
      expect(manager.validateFormation('4-4-0')).toBe(false); // 0 < 1
    });
  });
});
