import React from 'react';
import { useGame } from '../contexts/GameContext';
import './Menu.css';

const MainMenu: React.FC = () => {
  const { setCurrentScreen } = useGame();

  const handleNewCareer = () => {
    setCurrentScreen('clubSelection');
  };

  const handleLoadGame = () => {
    setCurrentScreen('loadGame');
  };

  const handleSettings = () => {
    setCurrentScreen('settings');
  };

  const handleQuit = () => {
    if (window.confirm('Are you sure you want to quit?')) {
      // In a real desktop app, this would close the window
      window.location.reload();
    }
  };

  return (
    <div className="menu-container main-menu">
      <div className="menu-content">
        <div className="game-title">
          <h1>⚽ Football Manager</h1>
          <h2>Simulator</h2>
        </div>

        <div className="menu-buttons">
          <button className="menu-button primary" onClick={handleNewCareer}>
            <span className="button-icon">🌟</span>
            <span className="button-text">New Career</span>
          </button>

          <button className="menu-button" onClick={handleLoadGame}>
            <span className="button-icon">📂</span>
            <span className="button-text">Load Game</span>
          </button>

          <button className="menu-button" onClick={handleSettings}>
            <span className="button-icon">⚙️</span>
            <span className="button-text">Settings</span>
          </button>

          <button className="menu-button" onClick={handleQuit}>
            <span className="button-icon">🚪</span>
            <span className="button-text">Quit</span>
          </button>
        </div>

        <div className="menu-footer">
          <p>Version 1.0.0 | Built with ❤️</p>
        </div>
      </div>
    </div>
  );
};

export default MainMenu;
