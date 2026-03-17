import React, { useEffect } from 'react';
import { useGame } from '../contexts/GameContext';
import './Menu.css';
import { AudioManager } from '../audio/AudioManager';

const SettingsPanel: React.FC = () => {
  const { settings, updateSettings, setCurrentScreen } = useGame();

  const handleBack = () => {
    // navigate back to where we came from (mainMenu or loadGame)
    setCurrentScreen('mainMenu');
  };

  const handleGraphicsChange = (quality: 'low' | 'medium' | 'high') => {
    updateSettings({ graphicsQuality: quality });
  };

  const handleAudioToggle = () => {
    updateSettings({ audioEnabled: !settings.audioEnabled });
  };

  const handleMusicVolumeChange = (volume: number) => {
    updateSettings({ musicVolume: volume });
  };

  const handleSoundVolumeChange = (volume: number) => {
    updateSettings({ soundVolume: volume });
  };

  const handleMatchSpeedChange = (speed: 'slow' | 'normal' | 'fast') => {
    updateSettings({ matchSpeed: speed });
  };

  const handleAutoSaveToggle = () => {
    updateSettings({ autoSave: !settings.autoSave });
  };

  const handleAutoSaveIntervalChange = (interval: number) => {
    updateSettings({ autoSaveInterval: interval });
  };

  const handleTooltipsToggle = () => {
    updateSettings({ showTooltips: !settings.showTooltips });
  };

  // Sync audio settings with AudioManager
  useEffect(() => {
    AudioManager.setSettings({
      muted: !settings.audioEnabled,
      musicVolume: settings.musicVolume / 100,
      sfxVolume: settings.soundVolume / 100,
    });
  }, [settings.audioEnabled, settings.musicVolume, settings.soundVolume]);

  return (
    <div className="menu-container settings-panel">
      <div className="settings-content">
        <div className="settings-header">
          <button className="back-button" onClick={handleBack}>
            ← Back
          </button>
          <h1>Settings</h1>
          <p>Customize your game experience</p>
        </div>

        <div className="settings-sections">
          {/* Graphics Settings */}
          <div className="settings-section">
            <h2>🖥️ Graphics</h2>
            <div className="setting-item">
              <label>Graphics Quality</label>
              <div className="button-group">
                {(['low', 'medium', 'high'] as const).map((quality) => (
                  <button
                    key={quality}
                    className={`group-button ${settings.graphicsQuality === quality ? 'active' : ''}`}
                    onClick={() => handleGraphicsChange(quality)}
                  >
                    {quality.charAt(0).toUpperCase() + quality.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Audio Settings */}
          <div className="settings-section">
            <h2>🔊 Audio</h2>
            <div className="setting-item">
              <label>Enable Audio</label>
              <button
                className={`toggle-button ${settings.audioEnabled ? 'on' : 'off'}`}
                onClick={handleAudioToggle}
              >
                {settings.audioEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            {settings.audioEnabled && (
              <>
                <div className="setting-item">
                  <label>Music Volume</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.musicVolume}
                      onChange={(e) => handleMusicVolumeChange(parseInt(e.target.value))}
                      className="slider"
                    />
                    <span className="slider-value">{settings.musicVolume}%</span>
                  </div>
                </div>

                <div className="setting-item">
                  <label>Sound Effects Volume</label>
                  <div className="slider-container">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={settings.soundVolume}
                      onChange={(e) => handleSoundVolumeChange(parseInt(e.target.value))}
                      className="slider"
                    />
                    <span className="slider-value">{settings.soundVolume}%</span>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Gameplay Settings */}
          <div className="settings-section">
            <h2>🎮 Gameplay</h2>
            <div className="setting-item">
              <label>Match Speed</label>
              <div className="button-group">
                {(['slow', 'normal', 'fast'] as const).map((speed) => (
                  <button
                    key={speed}
                    className={`group-button ${settings.matchSpeed === speed ? 'active' : ''}`}
                    onClick={() => handleMatchSpeedChange(speed)}
                  >
                    {speed.charAt(0).toUpperCase() + speed.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="setting-item">
              <label>Auto-Save</label>
              <button
                className={`toggle-button ${settings.autoSave ? 'on' : 'off'}`}
                onClick={handleAutoSaveToggle}
              >
                {settings.autoSave ? 'ON' : 'OFF'}
              </button>
            </div>

            {settings.autoSave && (
              <div className="setting-item">
                <label>Auto-Save Interval (minutes)</label>
                <div className="button-group">
                  {[1, 5, 10, 15, 30].map((interval) => (
                    <button
                      key={interval}
                      className={`group-button ${settings.autoSaveInterval === interval ? 'active' : ''}`}
                      onClick={() => handleAutoSaveIntervalChange(interval)}
                    >
                      {interval}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="setting-item">
              <label>Show Tooltips</label>
              <button
                className={`toggle-button ${settings.showTooltips ? 'on' : 'off'}`}
                onClick={handleTooltipsToggle}
              >
                {settings.showTooltips ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
