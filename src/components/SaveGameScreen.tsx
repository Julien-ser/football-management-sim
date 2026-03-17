import React, { useState, useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import { SaveGameStorage } from '../utils/SaveGameStorage';
import { SavedGame } from '../utils/SaveGameStorage';
import './Menu.css';

const SaveGameScreen: React.FC = () => {
  const { settings, currentTeam, teams, players, competitions, matches, calendar, currentTactics } =
    useGame();
  const [saveName, setSaveName] = useState<string>('');
  const [slotInfo, setSlotInfo] = useState<Array<{ slot: number; game: SavedGame | null }>>([]);
  const [message, setMessage] = useState<string>('');

  // Load save metadata on mount
  useEffect(() => {
    const metadata = SaveGameStorage.getAllSaveMetadata();
    setSlotInfo(metadata);
  }, []);

  const getCurrentGameState = (): Partial<SavedGame> => {
    const gameState: Partial<SavedGame> = {
      version: '1.0.0',
      timestamp: Date.now(),
      saveName: saveName || currentTeam?.name || 'Unnamed Save',
      teams,
      players,
      competitions,
      matches,
      settings,
      currentTactics,
      daysPlayed: 0,
      season: '2025-26',
    };

    // Only include calendar if it exists (not null)
    if (calendar) {
      gameState.calendar = calendar;
    }

    if (currentTeam) {
      gameState.currentTeamId = currentTeam.id;
    }

    return gameState;
  };

  const handleSave = (slot: number) => {
    const gameState = getCurrentGameState() as SavedGame;
    const success = SaveGameStorage.saveGame(slot, gameState);

    if (success) {
      setMessage(`Game saved to slot ${slot} successfully!`);
      // Refresh slot info
      const metadata = SaveGameStorage.getAllSaveMetadata();
      setSlotInfo(metadata);
      setSaveName('');
    } else {
      setMessage(`Failed to save game to slot ${slot}.`);
    }
  };

  const handleLoad = (slot: number) => {
    const save = SaveGameStorage.loadGame(slot);
    if (save) {
      setMessage(`Loaded save from slot ${slot} (${save.saveName}).`);
      // TODO: Actually load the game state into context
    } else {
      setMessage(`No save found in slot ${slot}.`);
    }
  };

  const handleDelete = (slot: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete save in slot ${slot}? This cannot be undone.`)) {
      SaveGameStorage.deleteSave(slot);
      setMessage(`Save slot ${slot} deleted.`);
      const metadata = SaveGameStorage.getAllSaveMetadata();
      setSlotInfo(metadata);
    }
  };

  const formatDate = (timestamp: number): string => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTeamName = (teamId: number | undefined): string => {
    if (!teamId) return 'No team selected';
    const team = teams.find((t) => t.id === teamId);
    return team?.name || 'Unknown Team';
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <div className="menu-container save-load-content">
      <div className="save-load-header">
        <button className="back-button" onClick={handleBack}>
          ← Back
        </button>
        <h1>Save / Load Game</h1>
      </div>

      <div className="save-name-section" style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'block', marginBottom: '0.5rem', color: '#9e9e9e' }}>
          Save Name (optional):
        </label>
        <input
          type="text"
          className="save-name-input"
          value={saveName}
          onChange={(e) => setSaveName(e.target.value)}
          placeholder={currentTeam?.name || 'Enter save name'}
          maxLength={50}
        />
      </div>

      {message && (
        <div
          style={{
            padding: '0.75rem',
            marginBottom: '1rem',
            background: 'rgba(76, 175, 80, 0.1)',
            border: '1px solid rgba(76, 175, 80, 0.3)',
            borderRadius: '4px',
            color: '#4caf50',
            textAlign: 'center',
          }}
        >
          {message}
        </div>
      )}

      <div className="save-slots-grid">
        {slotInfo.map(({ slot, game }) => (
          <div key={slot} className={`save-slot ${!game ? 'empty' : ''}`}>
            <div className="save-slot-header">
              <span className="slot-number">Slot {slot}</span>
              {!game && <span className="save-empty-text">Empty</span>}
            </div>

            {game ? (
              <div className="save-info">
                <p className="save-name">{game.saveName}</p>
                <p className="save-team">{getTeamName(game.currentTeamId)}</p>
                <div className="save-meta">
                  <span>📅 {formatDate(game.timestamp)}</span>
                  <span>📊 Season: {game.season}</span>
                  <span>⚽ Days Played: {game.daysPlayed}</span>
                </div>
                <div className="save-actions">
                  <button onClick={() => handleLoad(slot)}>Load</button>
                  <button className="delete" onClick={(e) => handleDelete(slot, e)}>
                    Delete
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                <button
                  className="select-button"
                  style={{ width: '100%' }}
                  onClick={() => handleSave(slot)}
                >
                  Save to Slot
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SaveGameScreen;
