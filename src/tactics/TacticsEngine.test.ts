import { TacticsEngine, createTacticsEngine } from './TacticsEngine';
import { Player } from '../models/Player';
import { Tactics } from '../models/Team';

describe('TacticsEngine', () => {
  let players: Player[];
  let tactics: Tactics;

  beforeEach(() => {
    players = [
      {
        id: 1,
        name: 'GK',
        position: 'goalkeeper',
        currentRating: 80,
        potential: 85,
        nationality: 'England',
        dateOfBirth: '1995-01-01',
        contract: { teamId: 0, salary: 50000, expiryDate: '2025-12-31' },
        stats: { goals: 0, assists: 0, appearances: 0, minutesPlayed: 0 },
      },
      {
        id: 2,
        name: 'DEF',
        position: 'center-back',
        currentRating: 78,
        potential: 82,
        nationality: 'England',
        dateOfBirth: '1995-01-01',
        contract: { teamId: 0, salary: 50000, expiryDate: '2025-12-31' },
        stats: { goals: 0, assists: 0, appearances: 0, minutesPlayed: 0 },
      },
      {
        id: 3,
        name: 'MID',
        position: 'central-midfielder',
        currentRating: 80,
        potential: 85,
        nationality: 'England',
        dateOfBirth: '1995-01-01',
        contract: { teamId: 0, salary: 50000, expiryDate: '2025-12-31' },
        stats: { goals: 0, assists: 0, appearances: 0, minutesPlayed: 0 },
      },
      {
        id: 4,
        name: 'STR',
        position: 'striker',
        currentRating: 82,
        potential: 88,
        nationality: 'England',
        dateOfBirth: '1995-01-01',
        contract: { teamId: 0, salary: 50000, expiryDate: '2025-12-31' },
        stats: { goals: 0, assists: 0, appearances: 0, minutesPlayed: 0 },
      },
    ];
    tactics = {
      formation: '4-4-2',
      mentality: 'balanced',
      pressingIntensity: 'medium',
      passingStyle: 'mixed',
      width: 'balanced',
      defensiveLine: 'medium',
      playerInstructions: [],
    };
  });

  describe('calculateModifiers', () => {
    it('should return default balanced modifiers when all settings are balanced/medium', () => {
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.attackMultiplier).toBe(1.0);
      expect(modifiers.defenseMultiplier).toBe(1.0);
      expect(modifiers.possessionMultiplier).toBe(1.0);
      expect(modifiers.pressingMultiplier).toBe(1.0);
      expect(modifiers.widthMultiplier).toBe(1.0);
      expect(modifiers.defensiveLineMultiplier).toBe(1.0);
      expect(modifiers.passAccuracyMultiplier).toBe(1.0);
      expect(modifiers.passingRangeMultiplier).toBe(1.0);
      expect(modifiers.crossingMultiplier).toBe(1.0);
      expect(modifiers.shootingMultiplier).toBeCloseTo(1.0, 2);
      expect(modifiers.tacklingMultiplier).toBe(1.0);
      expect(modifiers.foulPropensity).toBe(1.0);
    });

    it('should apply attacking mentality correctly', () => {
      tactics.mentality = 'attacking';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.attackMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.defenseMultiplier).toBeLessThan(1.0);
    });

    it('should apply defensive mentality correctly', () => {
      tactics.mentality = 'defensive';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.attackMultiplier).toBeLessThan(1.0);
      expect(modifiers.defenseMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply high pressing correctly', () => {
      tactics.pressingIntensity = 'high';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.pressingMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.foulPropensity).toBeGreaterThan(1.0);
    });

    it('should apply low pressing correctly', () => {
      tactics.pressingIntensity = 'low';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.pressingMultiplier).toBeLessThan(1.0);
      expect(modifiers.foulPropensity).toBeLessThan(1.0);
    });

    it('should apply short passing correctly', () => {
      tactics.passingStyle = 'short';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.possessionMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.passAccuracyMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.passingRangeMultiplier).toBeLessThan(1.0);
      expect(modifiers.crossingMultiplier).toBeLessThan(1.0);
    });

    it('should apply long passing correctly', () => {
      tactics.passingStyle = 'long';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.possessionMultiplier).toBeLessThan(1.0);
      expect(modifiers.passAccuracyMultiplier).toBeLessThan(1.0);
      expect(modifiers.passingRangeMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.crossingMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply wide width correctly', () => {
      tactics.width = 'wide';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.widthMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.crossingMultiplier).toBeGreaterThan(1.0);
    });

    it('should apply narrow width correctly', () => {
      tactics.width = 'narrow';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.widthMultiplier).toBeLessThan(1.0);
      expect(modifiers.crossingMultiplier).toBeLessThan(1.0);
    });

    it('should apply high defensive line correctly', () => {
      tactics.defensiveLine = 'high';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.defensiveLineMultiplier).toBeGreaterThan(1.0);
      expect(modifiers.pressingMultiplier).toBeGreaterThan(1.0); // additional press
    });

    it('should apply low defensive line correctly', () => {
      tactics.defensiveLine = 'low';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      expect(modifiers.defensiveLineMultiplier).toBeLessThan(1.0);
      expect(modifiers.defenseMultiplier).toBeGreaterThan(1.0); // extra defense
    });

    it('should calculate shooting multiplier correctly with attacking mentality', () => {
      tactics.mentality = 'attacking';
      tactics.pressingIntensity = 'high';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      // shootingMultiplier = attackMultiplier * (1 + (pressingMultiplier - 1) * 0.3)
      const expected = 1.3 * (1 + (1.5 - 1) * 0.3);
      expect(modifiers.shootingMultiplier).toBeCloseTo(expected, 2);
    });

    it('should calculate tackling multiplier correctly', () => {
      tactics.mentality = 'defensive';
      tactics.pressingIntensity = 'high';
      const engine = new TacticsEngine(tactics, players);
      const modifiers = engine.calculateModifiers();

      // tacklingMultiplier = defenseMultiplier * pressingMultiplier
      const expected = 1.3 * 1.5;
      expect(modifiers.tacklingMultiplier).toBeCloseTo(expected, 2);
    });
  });

  describe('calculateSuitability', () => {
    it('should return default scores when no starting XI provided', () => {
      tactics.mentality = 'balanced';
      const engine = new TacticsEngine(tactics, players);
      const suitability = engine.calculateSuitability(undefined);

      // Without starting XI: formationFit = 30, roleFit = 50, instructionScore = 50 -> overall = 30*0.4 + 50*0.4 + 50*0.2 = 42
      expect(suitability.overall).toBe(42);
      expect(suitability.formationFit).toBe(30);
      expect(suitability.roleFit).toBe(50);
      expect(Object.keys(suitability.instructions).length).toBe(0);
    });

    it('should return default scores when empty starting XI provided', () => {
      const engine = new TacticsEngine(tactics, players);
      const suitability = engine.calculateSuitability([]);

      expect(suitability.overall).toBe(42);
      expect(suitability.formationFit).toBe(30);
      expect(suitability.roleFit).toBe(50);
    });

    it('should increase formationFit for players in starting XI', () => {
      const engine = new TacticsEngine(tactics, players);
      const startingXI = [
        { playerId: 1, position: 'goalkeeper', role: 'Sweeper Keeper' },
        { playerId: 2, position: 'center-back', role: 'Central Defender' },
        { playerId: 3, position: 'central-midfielder', role: 'Box-to-Box Midfielder' },
        { playerId: 4, position: 'striker', role: 'Complete Forward' },
      ];
      const suitability = engine.calculateSuitability(startingXI);

      // All players in startingXI should have formationFit 80, others 30
      expect(suitability.formationFit).toBeGreaterThan(50); // average > 50 because 4 selected out of 4 (all included)
      // Actually all 4 players are in XI, so each formationFit=80 -> average 80
      expect(suitability.formationFit).toBeCloseTo(80, 1);
    });

    it('should calculate roleFit using calculateRoleFit', () => {
      const engine = new TacticsEngine(tactics, players);
      const startingXI = [{ playerId: 4, position: 'striker', role: 'Complete Forward' }];
      const suitability = engine.calculateSuitability(startingXI);

      // roleFit for player 4 should be around 50 + (82-50)*0.5 + (88-82)*0.2 = 50 + 16 + 1.2 = 67.2, capped at 100
      // Since rating 82, potential 88, we can approximate > 50
      expect(suitability.roleFit).toBeGreaterThan(50);
    });

    it('should apply player instructions compliance scoring', () => {
      const instructions = [
        { playerId: 1, role: 'Sweeper Keeper' },
        { playerId: 2, role: 'Central Defender' },
      ];
      const engine = new TacticsEngine(tactics, players, instructions);
      const suitability = engine.calculateSuitability();

      // No starting XI: formationFit=30, roleFit=50 for all.
      // Instructions: players 1 & 2 get 70, others 50.
      // Overall = average of: for instr: 30*0.4+50*0.4+70*0.2 = 12+20+14=46; for no instr: 12+20+10=42.
      // With 2 each: (46+46+42+42)/4 = 44.
      expect(suitability.overall).toBe(44);
      expect(suitability.formationFit).toBe(30);
      expect(suitability.roleFit).toBe(50);
    });

    it('should handle zero players gracefully', () => {
      const engine = new TacticsEngine(tactics, []);
      const suitability = engine.calculateSuitability();

      expect(suitability.overall).toBe(50);
      expect(suitability.formationFit).toBe(50);
      expect(suitability.roleFit).toBe(50);
      expect(suitability.instructions).toEqual({});
    });
  });

  describe('factory function', () => {
    it('should create TacticsEngine via createTacticsEngine', () => {
      const engine = createTacticsEngine(tactics, players);
      expect(engine instanceof TacticsEngine).toBe(true);
    });
  });
});
