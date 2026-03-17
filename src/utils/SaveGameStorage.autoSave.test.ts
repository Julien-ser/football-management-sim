import { SaveGameStorage } from './SaveGameStorage';

describe('SaveGameStorage Auto-Save', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should save and load auto-save data', () => {
    const autoSaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      saveName: 'Test Auto-Save',
      teams: [],
      players: [],
      competitions: [],
      matches: [],
      settings: { autoSave: true } as const,
      currentTactics: { formation: '4-4-2' } as const,
      daysPlayed: 10,
      season: '2025-26',
    };
    const result = SaveGameStorage.autoSaveGame(autoSaveData);
    expect(result).toBe(true);
    const loaded = SaveGameStorage.loadAutoSave();
    expect(loaded).not.toBeNull();
    expect(loaded?.saveName).toBe('Test Auto-Save');
    expect(loaded?.teams).toEqual([]);
  });

  it('should report hasAutoSave correctly', () => {
    expect(SaveGameStorage.hasAutoSave()).toBe(false);
    SaveGameStorage.autoSaveGame({ teams: [] });
    expect(SaveGameStorage.hasAutoSave()).toBe(true);
    SaveGameStorage.deleteAutoSave();
    expect(SaveGameStorage.hasAutoSave()).toBe(false);
  });

  it('should delete auto-save', () => {
    SaveGameStorage.autoSaveGame({ teams: [] });
    expect(SaveGameStorage.hasAutoSave()).toBe(true);
    const result = SaveGameStorage.deleteAutoSave();
    expect(result).toBe(true);
    expect(SaveGameStorage.hasAutoSave()).toBe(false);
  });
});
