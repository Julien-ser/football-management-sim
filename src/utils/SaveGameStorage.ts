import { Team, Player, Competition, Match } from '../models';
import { Calendar } from '../competition/Calendar';
import { Tactics } from '../models/Team';
import { GameSettings } from '../contexts/GameContext';

export interface SavedGame {
  version: string;
  timestamp: number;
  saveName: string;
  // Game state
  teams: Team[];
  players: Player[];
  competitions: Competition[];
  matches: Match[];
  calendar?: Calendar;
  currentTeamId?: number;
  // Settings
  settings: GameSettings;
  currentTactics: Tactics;
  // Metadata
  daysPlayed: number;
  season: string;
}

const STORAGE_PREFIX = 'football_manager_save_';
const AUTO_SAVE_KEY = 'football_manager_auto_save';
const MAX_SAVE_SLOTS = 10;

export class SaveGameStorage {
  /**
   * Save game state to localStorage
   */
  static saveGame(slot: number, gameState: SavedGame): boolean {
    try {
      const key = `${STORAGE_PREFIX}slot_${slot}`;
      const serialized = JSON.stringify(gameState);
      localStorage.setItem(key, serialized);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      return false;
    }
  }

  /**
   * Load game state from localStorage
   */
  static loadGame(slot: number): SavedGame | null {
    try {
      const key = `${STORAGE_PREFIX}slot_${slot}`;
      const serialized = localStorage.getItem(key);
      if (!serialized) {
        return null;
      }
      const data = JSON.parse(serialized) as SavedGame;
      // Reconstruct Calendar instance if present
      if (
        data.calendar &&
        typeof data.calendar === 'object' &&
        !(data.calendar instanceof Calendar)
      ) {
        data.calendar = Calendar.fromJSON(data.calendar);
      }
      return data;
    } catch (error) {
      console.error('Failed to load game:', error);
      return null;
    }
  }

  /**
   * Check if a save slot exists
   */
  static saveExists(slot: number): boolean {
    const key = `${STORAGE_PREFIX}slot_${slot}`;
    return localStorage.getItem(key) !== null;
  }

  /**
   * Get save metadata for all slots
   */
  static getAllSaveMetadata(): Array<{ slot: number; game: SavedGame | null }> {
    const metadata: Array<{ slot: number; game: SavedGame | null }> = [];
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      metadata.push({
        slot: i + 1,
        game: this.loadGame(i + 1),
      });
    }
    return metadata;
  }

  /**
   * Delete a save slot
   */
  static deleteSave(slot: number): boolean {
    try {
      const key = `${STORAGE_PREFIX}slot_${slot}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to delete save:', error);
      return false;
    }
  }

  /**
   * Clear all saves (for development/testing)
   */
  static clearAllSaves(): void {
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      this.deleteSave(i + 1);
    }
  }

  /**
   * Count total number of saves
   */
  static getSaveCount(): number {
    let count = 0;
    for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
      if (this.saveExists(i + 1)) {
        count++;
      }
    }
    return count;
  }

  /**
   * Save auto-save data to a special key
   */
  static autoSaveGame(gameState: Partial<SavedGame>): boolean {
    try {
      const serialized = JSON.stringify(gameState);
      localStorage.setItem(AUTO_SAVE_KEY, serialized);
      return true;
    } catch (error) {
      console.error('Failed to auto-save game:', error);
      return false;
    }
  }

  /**
   * Load auto-save data
   */
  static loadAutoSave(): SavedGame | null {
    try {
      const serialized = localStorage.getItem(AUTO_SAVE_KEY);
      if (!serialized) {
        return null;
      }
      const data = JSON.parse(serialized) as SavedGame;
      // Reconstruct Calendar instance if present
      if (
        data.calendar &&
        typeof data.calendar === 'object' &&
        !(data.calendar instanceof Calendar)
      ) {
        data.calendar = Calendar.fromJSON(data.calendar);
      }
      return data;
    } catch (error) {
      console.error('Failed to load auto-save:', error);
      return null;
    }
  }

  /**
   * Check if auto-save exists
   */
  static hasAutoSave(): boolean {
    return localStorage.getItem(AUTO_SAVE_KEY) !== null;
  }

  /**
   * Delete auto-save
   */
  static deleteAutoSave(): boolean {
    try {
      localStorage.removeItem(AUTO_SAVE_KEY);
      return true;
    } catch (error) {
      console.error('Failed to delete auto-save:', error);
      return false;
    }
  }
}
