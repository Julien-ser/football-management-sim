import React, { useState } from 'react';
import { useGame } from '../contexts/GameContext';
import { Tactics } from '../models/Team';
import { Player } from '../models/Player';
import './MatchDay.css';

interface TacticalOverlayProps {
  isVisible: boolean;
  onClose: () => void;
  homeTeamId: number;
  awayTeamId: number;
  homePlayers: Player[];
  awayPlayers: Player[];
  currentTactics: Tactics;
  onTacticsChange: (team: 'home' | 'away', tactics: Partial<Tactics>) => void;
  onSubstitution: (playerOutId: number, playerInId: number) => void;
}

const FORMATIONS = [
  '4-4-2',
  '4-3-3',
  '4-2-3-1',
  '4-5-1',
  '3-5-2',
  '5-3-2',
  '3-4-3',
  '4-1-4-1',
] as const;

const MENTALITIES: Array<'defensive' | 'balanced' | 'attacking'> = [
  'defensive',
  'balanced',
  'attacking',
];

const PRESSING_INTENSITIES = ['low', 'medium', 'high'] as const;
const PASSING_STYLES = ['short', 'mixed', 'long'] as const;
const WIDTHS = ['narrow', 'balanced', 'wide'] as const;
const DEFENSIVE_LINES = ['low', 'medium', 'high'] as const;

const TacticalOverlay: React.FC<TacticalOverlayProps> = ({
  isVisible,
  onClose,
  homeTeamId,
  awayTeamId,
  homePlayers,
  awayPlayers,
  currentTactics,
  onTacticsChange,
  onSubstitution,
}) => {
  const { currentTeam } = useGame();
  const isHomeTeam = currentTeam?.id === homeTeamId;
  const [activeTab, setActiveTab] = useState<'tactics' | 'substitutions'>('tactics');
  const [formation, setFormation] = useState<string>(currentTactics.formation);
  const [mentality, setMentality] = useState<Mentality>(currentTactics.mentality);
  const [pressingIntensity, setPressingIntensity] = useState<string>(
    currentTactics.pressingIntensity
  );
  const [passingStyle, setPassingStyle] = useState<string>(currentTactics.passingStyle);
  const [width, setWidth] = useState<string>(currentTactics.width);
  const [defensiveLine, setDefensiveLine] = useState<string>(currentTactics.defensiveLine);

  if (!isVisible) return null;

  const handleTacticsApply = () => {
    onTacticsChange('home', {
      formation: formation as Formation,
      mentality,
      pressingIntensity: pressingIntensity as 'low' | 'medium' | 'high',
      passingStyle: passingStyle as 'short' | 'mixed' | 'long',
      width: width as 'narrow' | 'balanced' | 'wide',
      defensiveLine: defensiveLine as 'low' | 'medium' | 'high',
    });
    onClose();
  };

  const getPlayerPositionFromFormation = (formation: string, index: number): string => {
    const positions: { [key: string]: string[] } = {
      '4-4-2': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'ST', 'ST'],
      '4-3-3': ['GK', 'RB', 'CB', 'CB', 'LB', 'CM', 'CM', 'CM', 'RW', 'ST', 'LW'],
      '4-2-3-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'CDM', 'CAM', 'CAM', 'CAM', 'ST'],
      '4-5-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'RM', 'CM', 'CM', 'CM', 'LM', 'ST'],
      '3-5-2': ['GK', 'CB', 'CB', 'CB', 'RM', 'CDM', 'CM', 'CM', 'LM', 'ST', 'ST'],
      '5-3-2': ['GK', 'RWB', 'CB', 'CB', 'CB', 'LWB', 'CM', 'CM', 'CM', 'ST', 'ST'],
      '3-4-3': ['GK', 'RB', 'CB', 'LB', 'RM', 'CM', 'CM', 'LM', 'RW', 'ST', 'LW'],
      '4-1-4-1': ['GK', 'RB', 'CB', 'CB', 'LB', 'CDM', 'RM', 'CM', 'CM', 'LM', 'ST'],
    };
    return positions[formation]?.[index] || 'CM';
  };

  const availableSubstitutes = homePlayers.filter(
    (p) => !homePlayers.find((pl) => pl.id === p.id) || true // Simplified - would need to track starting XI
  );

  return (
    <div className="tactical-overlay-backdrop">
      <div className="tactical-overlay">
        <div className="overlay-header">
          <h2>⚙️ Tactical Changes</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="overlay-tabs">
          <button
            className={`tab ${activeTab === 'tactics' ? 'active' : ''}`}
            onClick={() => setActiveTab('tactics')}
          >
            Formation & Tactics
          </button>
          <button
            className={`tab ${activeTab === 'substitutions' ? 'active' : ''}`}
            onClick={() => setActiveTab('substitutions')}
          >
            Substitutions
          </button>
        </div>

        <div className="overlay-content">
          {activeTab === 'tactics' && (
            <div className="tactics-form">
              <div className="form-group">
                <label>Formation</label>
                <select
                  value={formation}
                  onChange={(e) => setFormation(e.target.value)}
                  className="tactics-select"
                >
                  {FORMATIONS.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Mentality</label>
                <select
                  value={mentality}
                  onChange={(e) =>
                    setMentality(e.target.value as 'defensive' | 'balanced' | 'attacking')
                  }
                  className="tactics-select"
                >
                  {MENTALITIES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Pressing Intensity</label>
                <select
                  value={pressingIntensity}
                  onChange={(e) => setPressingIntensity(e.target.value)}
                  className="tactics-select"
                >
                  {PRESSING_INTENSITIES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Passing Style</label>
                <select
                  value={passingStyle}
                  onChange={(e) => setPassingStyle(e.target.value)}
                  className="tactics-select"
                >
                  {PASSING_STYLES.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Width</label>
                <select
                  value={width}
                  onChange={(e) => setWidth(e.target.value)}
                  className="tactics-select"
                >
                  {WIDTHS.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Defensive Line</label>
                <select
                  value={defensiveLine}
                  onChange={(e) => setDefensiveLine(e.target.value)}
                  className="tactics-select"
                >
                  {DEFENSIVE_LINES.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <button className="apply-tactics-btn" onClick={handleTacticsApply}>
                Apply Tactical Changes
              </button>
            </div>
          )}

          {activeTab === 'substitutions' && (
            <div className="substitutions-form">
              <p className="substitution-info">Maximum 3 substitutions per match</p>
              <div className="substitution-pairs">
                <div className="form-group">
                  <label>Player to Substitute OUT</label>
                  <select className="substitution-select">
                    {homePlayers.slice(0, 11).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Player to Substitute IN</label>
                  <select className="substitution-select">
                    {homePlayers.slice(11).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.position})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button className="substitution-btn">Make Substitution</button>
              <p className="note">
                Note: Full substitution logic with fatigue tracking coming soon
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TacticalOverlay;
