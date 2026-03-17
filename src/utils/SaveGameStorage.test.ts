import { SaveGameStorage } from './SaveGameStorage';
import { Team, Player, Competition, Match } from '../models';
import { Calendar } from '../competition/Calendar';
import { Tactics } from '../models/Team';
import { GameSettings } from '../contexts/GameContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('SaveGameStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  const mockTeam: Team = {
    id: 1,
    name: 'Test Team',
    players: [],
    tactics: { formation: '4-4-2', mentality: 'balanced' } as Tactics,
    budget: 1000000,
    competitions: [],
  };

  const mockPlayer: Player = {
    id: 1,
    firstName: 'John',
    lastName: 'Doe',
    position: 'ST',
    currentRating: 75,
    potential: 80,
    age: 25,
    contract: {
      salary: 50000,
      expiryDate: '2025-12-31',
      bonuses: [],
    },
  };

  const mockCompetition: Competition = {
    id: 1,
    name: 'Premier League',
    type: 'league',
    teams: [],
    fixtures: [],
  };

  const mockMatch: Match = {
    id: 1,
    homeTeamId: 1,
    awayTeamId: 2,
    competitionId: 1,
    date: '2025-01-01',
    homeScore: 0,
    awayScore: 0,
    status: 'scheduled',
    events: [],
    stats: {
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      passes: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      offsides: { home: 0, away: 0 },
      cards: { home: 0, away: 0 },
    },
  };

  const mockGameSettings: GameSettings = {
    graphicsQuality: 'high',
    audioEnabled: true,
    matchSpeed: 'normal',
    autoSaveEnabled: true,
    autoSaveInterval: 5,
  };

  const mockCurrentTactics: Tactics = {
    formation: '4-4-2',
    mentality: 'attacking',
    pressingIntensity: 'high',
    passingStyle: 'short',
    width: 'wide',
    defensiveLine: 'high',
  };

  const mockSavedGame = (slot: number = 1): SavedGame => ({
    version: '1.0.0',
    timestamp: Date.now(),
    saveName: `Save ${slot}`,
    teams: [mockTeam],
    players: [mockPlayer],
    competitions: [mockCompetition],
    matches: [mockMatch],
    calendar: new Calendar([mockCompetition]),
    currentTeamId: 1,
    settings: mockGameSettings,
    currentTactics: mockCurrentTactics,
    daysPlayed: 100,
    season: '2025-2026',
  });

  describe('saveGame', () => {
    it('should save game state successfully', () => {
      const result = SaveGameStorage.saveGame(1, mockSavedGame(1));
      expect(result).toBe(true);
      expect(localStorage.getItem('football_manager_save_slot_1')).toBeTruthy();
    });

    it('should return false when localStorage is full', () => {
      // Mock a quota exceeded error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = () => {
        throw new Error('QuotaExceededError');
      };

      const result = SaveGameStorage.saveGame(1, mockSavedGame(1));
      expect(result).toBe(false);

      localStorage.setItem = originalSetItem;
    });

    it('should serialize complex objects correctly', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      const stored = localStorage.getItem('football_manager_save_slot_1');
      const parsed = JSON.parse(stored!);
      expect(parsed.teams[0].name).toBe('Test Team');
      expect(parsed.players[0].firstName).toBe('John');
    });
  });

  describe('loadGame', () => {
    it('should load game state successfully', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      const loaded = SaveGameStorage.loadGame(1);
      expect(loaded).not.toBeNull();
      expect(loaded!.teams[0].name).toBe('Test Team');
      expect(loaded!.version).toBe('1.0.0');
    });

    it('should return null for non-existent save', () => {
      const loaded = SaveGameStorage.loadGame(999);
      expect(loaded).toBeNull();
    });

    it('should handle corrupted JSON data', () => {
      localStorage.setItem('football_manager_save_slot_1', 'invalid json{');
      const loaded = SaveGameStorage.loadGame(1);
      expect(loaded).toBeNull();
    });

    it('should correctly parse Calendar object', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      const loaded = SaveGameStorage.loadGame(1);
      expect(loaded!.calendar).toBeInstanceOf(Calendar);
    });
  });

  describe('saveExists', () => {
    it('should return true for existing save', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      expect(SaveGameStorage.saveExists(1)).toBe(true);
    });

    it('should return false for non-existent save', () => {
      expect(SaveGameStorage.saveExists(999)).toBe(false);
    });
  });

  describe('getAllSaveMetadata', () => {
    it('should return metadata for all slots', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      SaveGameStorage.saveGame(2, mockSavedGame(2));
      const metadata = SaveGameStorage.getAllSaveMetadata();
      expect(metadata.length).toBe(10);
      expect(metadata[0].slot).toBe(1);
      expect(metadata[0].game).not.toBeNull();
      expect(metadata[1].game).not.toBeNull();
      // Empty slots
      expect(metadata[9].game).toBeNull();
    });

    it('should return null for empty slots', () => {
      const metadata = SaveGameStorage.getAllSaveMetadata();
      metadata.forEach((slot) => {
        if (!SaveGameStorage.saveExists(slot.slot)) {
          expect(slot.game).toBeNull();
        }
      });
    });
  });

  describe('deleteSave', () => {
    it('should delete a save successfully', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      expect(SaveGameStorage.saveExists(1)).toBe(true);
      const result = SaveGameStorage.deleteSave(1);
      expect(result).toBe(true);
      expect(SaveGameStorage.saveExists(1)).toBe(false);
    });

    it('should return false when deletion fails', () => {
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = () => {
        throw new Error('Storage failure');
      };

      const result = SaveGameStorage.deleteSave(1);
      expect(result).toBe(false);

      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('clearAllSaves', () => {
    it('should clear all saved games', () => {
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      SaveGameStorage.saveGame(2, mockSavedGame(2));
      SaveGameStorage.clearAllSaves();
      expect(SaveGameStorage.getSaveCount()).toBe(0);
    });
  });

  describe('getSaveCount', () => {
    it('should count saves correctly', () => {
      expect(SaveGameStorage.getSaveCount()).toBe(0);
      SaveGameStorage.saveGame(1, mockSavedGame(1));
      SaveGameStorage.saveGame(3, mockSavedGame(3));
      SaveGameStorage.saveGame(5, mockSavedGame(5));
      expect(SaveGameStorage.getSaveCount()).toBe(3);
    });
  });

  describe('autoSaveGame', () => {
    it('should save auto-save data', () => {
      const partialState = {
        teams: [mockTeam],
        daysPlayed: 50,
      } as Partial<SavedGame>;
      const result = SaveGameStorage.autoSaveGame(partialState);
      expect(result).toBe(true);
      expect(localStorage.getItem('football_manager_auto_save')).toBeTruthy();
    });

    it('should overwrite previous auto-save', () => {
      SaveGameStorage.autoSaveGame({ daysPlayed: 50 } as Partial<SavedGame>);
      SaveGameStorage.autoSaveGame({ daysPlayed: 100 } as Partial<SavedGame>);
      const loaded = SaveGameStorage.loadAutoSave();
      expect(loaded!.daysPlayed).toBe(100);
    });
  });

  describe('loadAutoSave', () => {
    it('should load auto-save data', () => {
      SaveGameStorage.autoSaveGame(mockSavedGame(1));
      const loaded = SaveGameStorage.loadAutoSave();
      expect(loaded).not.toBeNull();
      expect(loaded!.teams[0].name).toBe('Test Team');
    });

    it('should return null when no auto-save exists', () => {
      const loaded = SaveGameStorage.loadAutoSave();
      expect(loaded).toBeNull();
    });
  });

  describe('hasAutoSave', () => {
    it('should return true when auto-save exists', () => {
      SaveGameStorage.autoSaveGame(mockSavedGame(1));
      expect(SaveGameStorage.hasAutoSave()).toBe(true);
    });

    it('should return false when no auto-save exists', () => {
      expect(SaveGameStorage.hasAutoSave()).toBe(false);
    });
  });

  describe('deleteAutoSave', () => {
    it('should delete auto-save successfully', () => {
      SaveGameStorage.autoSaveGame(mockSavedGame(1));
      expect(SaveGameStorage.hasAutoSave()).toBe(true);
      const result = SaveGameStorage.deleteAutoSave();
      expect(result).toBe(true);
      expect(SaveGameStorage.hasAutoSave()).toBe(false);
    });

    it('should return false when deletion fails', () => {
      SaveGameStorage.autoSaveGame(mockSavedGame(1));
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = () => {
        throw new Error('Storage failure');
      };

      const result = SaveGameStorage.deleteAutoSave();
      expect(result).toBe(false);

      localStorage.removeItem = originalRemoveItem;
    });
  });
});
