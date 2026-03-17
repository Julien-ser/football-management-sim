import React from 'react';
import { useGame } from './contexts/GameContext';
import MainMenu from './components/MainMenu';
import ClubSelection from './components/ClubSelection';
import SettingsPanel from './components/SettingsPanel';
import GameHUD from './components/GameHUD';
import MatchDayContainer from './components/MatchDayContainer';
import './styles/App.css';

const App: React.FC = () => {
  const {
    currentScreen,
    setCurrentScreen,
    isMatchInProgress,
    currentTeam,
    setCurrentTeam,
    setTeams,
    setPlayers,
    setCompetitions,
    setMatches,
    setCalendar,
  } = useGame();

  // If match is in progress, show match day UI regardless of currentScreen
  if (isMatchInProgress) {
    return <MatchDayContainer onExitMatch={() => setCurrentScreen('game')} />;
  }

  // Render appropriate screen based on navigation state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'mainMenu':
        return <MainMenu />;
      case 'clubSelection':
        return <ClubSelection />;
      case 'settings':
        return <SettingsPanel />;
      case 'game':
      default:
        return currentTeam ? <GameHUD /> : <MainMenu />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
};

export default App;
