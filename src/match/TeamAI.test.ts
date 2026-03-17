import { TeamAI } from './TeamAI';
import type { Team, Tactics } from '../models/Team';
import type { Player } from '../models/Player';

describe('TeamAI', () => {
  let players: Player[];
  let team: Team;
  let tactics: Tactics;
  let teamAI: TeamAI;

  const createPlayer = (overrides: Partial<Player>): Player => ({
    id: 0,
    name: '',
    position: 'goalkeeper',
    currentRating: 50,
    potential: 50,
    nationality: 'England',
    dateOfBirth: '2000-01-01',
    contract: { teamId: 0, salary: 10000, expiryDate: '2025-12-31' },
    stats: { goals: 0, assists: 0, appearances: 0, minutesPlayed: 0 },
    ...overrides,
  });

  const createTeam = (overrides: Partial<Team> = {}): Team => ({
    id: 1,
    name: 'Test Team',
    shortName: 'TST',
    stadium: 'Test Stadium',
    capacity: 50000,
    leagueId: 1,
    manager: 'Manager',
    budget: 1000000,
    players: [],
    morale: 50,
    boardConfidence: 50,
    ...overrides,
  });

  beforeEach(() => {
    players = [
      createPlayer({ id: 1, name: 'GK', position: 'goalkeeper' }),
      createPlayer({ id: 2, name: 'CB1', position: 'center-back' }),
      createPlayer({ id: 3, name: 'CB2', position: 'center-back' }),
      createPlayer({ id: 4, name: 'LB', position: 'left-back' }),
      createPlayer({ id: 5, name: 'RB', position: 'right-back' }),
      createPlayer({ id: 6, name: 'DM', position: 'defensive-midfielder' }),
      createPlayer({ id: 7, name: 'CM1', position: 'central-midfielder' }),
      createPlayer({ id: 8, name: 'CM2', position: 'attacking-midfielder' }),
      createPlayer({ id: 9, name: 'RW', position: 'right-winger' }),
      createPlayer({ id: 10, name: 'LW', position: 'left-winger' }),
      createPlayer({ id: 11, name: 'ST1', position: 'striker' }),
      createPlayer({ id: 12, name: 'ST2', position: 'striker' }),
    ];
    team = createTeam({ players: players.map((p) => p.id) });
    tactics = {
      formation: '4-4-2',
      mentality: 'balanced',
      pressingIntensity: 'medium',
      passingStyle: 'mixed',
      playerInstructions: [],
    };
    teamAI = new TeamAI(team, players, tactics);
  });

  describe('constructor', () => {
    it('uses provided tactics', () => {
      expect(teamAI.getTactics()).toEqual(tactics);
    });

    it('fallback to team tactics when no tactics provided', () => {
      const ai = new TeamAI(team, players);
      expect(ai.getTactics()).toEqual(team.tactics);
    });

    it('use default tactics when none available', () => {
      const ai = new TeamAI(createTeam(), players);
      const defaultTactics = ai.getTactics();
      expect(defaultTactics.formation).toBe('4-4-2');
      expect(defaultTactics.mentality).toBe('balanced');
    });
  });

  describe('selectStartingXI', () => {
    it('selects correct number for 4-4-2', () => {
      expect(teamAI.getStartingXI().length).toBe(11);
    });

    it('selects highest rated players', () => {
      const XI = teamAI.getStartingXI();
      const gk = XI.find((p) => p.position === 'GK');
      expect(gk?.playerId).toBe(1);
    });

    it('assigns roles based on mentality', () => {
      teamAI.updateTactics({ mentality: 'attacking' });
      const XI = teamAI.getStartingXI();
      const striker = XI.find((p) => p.position.includes('ST'));
      expect(striker?.role).toBe('Complete Forward');
    });
  });

  describe('adjustRoleByDuty', () => {
    it('maps all Advanced Forward duties', () => {
      expect(teamAI['adjustRoleByDuty']('Advanced Forward', 'support')).toBe('Complete Forward');
      expect(teamAI['adjustRoleByDuty']('Advanced Forward', 'attack')).toBe('Advanced Forward');
      expect(teamAI['adjustRoleByDuty']('Advanced Forward', 'defense')).toBe('Target Man');
    });

    it('maps Box-to-Box Midfielder duties', () => {
      expect(teamAI['adjustRoleByDuty']('Box-to-Box Midfielder', 'support')).toBe(
        'Deep Lying Midfielder'
      );
      expect(teamAI['adjustRoleByDuty']('Box-to-Box Midfielder', 'attack')).toBe(
        'Advanced Playmaker'
      );
      expect(teamAI['adjustRoleByDuty']('Box-to-Box Midfielder', 'defense')).toBe(
        'Defensive Midfielder'
      );
    });

    it('returns base role for unknown mappings', () => {
      expect(teamAI['adjustRoleByDuty']('UnknownRole', 'attack')).toBe('UnknownRole');
    });
  });

  describe('matchesPosition', () => {
    it('matches GK to GK', () => expect(teamAI['matchesPosition']('goalkeeper', 'GK')).toBe(true));
    it('matches CB to CB', () =>
      expect(teamAI['matchesPosition']('center-back', 'CB1')).toBe(true));
    it('matches LB to LB', () => expect(teamAI['matchesPosition']('left-back', 'LB')).toBe(true));
    it('matches RB to RB', () => expect(teamAI['matchesPosition']('right-back', 'RB')).toBe(true));
    it('matches DM to CM', () =>
      expect(teamAI['matchesPosition']('defensive-midfielder', 'CM1')).toBe(true));
    it('matches CM to CM', () =>
      expect(teamAI['matchesPosition']('central-midfielder', 'CM2')).toBe(true));
    it('matches AM to CM', () =>
      expect(teamAI['matchesPosition']('attacking-midfielder', 'CM1')).toBe(true));
    it('matches ST to ST', () => expect(teamAI['matchesPosition']('striker', 'ST1')).toBe(true));
    it('matches winger to ST', () =>
      expect(teamAI['matchesPosition']('right-winger', 'ST2')).toBe(true));
    it('rejects mismatched positions', () => {
      expect(teamAI['matchesPosition']('goalkeeper', 'CB1')).toBe(false);
      expect(teamAI['matchesPosition']('striker', 'GK')).toBe(false);
    });
  });

  describe('getRoleForPosition', () => {
    it('returns GK roles by mentality', () => {
      expect(teamAI['getRoleForPosition']('GK', 'defensive')).toBe('Sweeper Keeper');
      expect(teamAI['getRoleForPosition']('GK', 'balanced')).toBe('Goalkeeper');
      expect(teamAI['getRoleForPosition']('GK', 'attacking')).toBe('Goalkeeper');
    });

    it('returns CB roles by mentality', () => {
      expect(teamAI['getRoleForPosition']('CB1', 'defensive')).toBe('Central Defender');
      expect(teamAI['getRoleForPosition']('CB1', 'balanced')).toBe('Ball Playing Defender');
    });

    it('returns CM roles by mentality', () => {
      expect(teamAI['getRoleForPosition']('CM1', 'defensive')).toBe('Defensive Midfielder');
      expect(teamAI['getRoleForPosition']('CM1', 'balanced')).toBe('Box-to-Box Midfielder');
      expect(teamAI['getRoleForPosition']('CM1', 'attacking')).toBe('Advanced Playmaker');
    });

    it('returns ST roles by mentality', () => {
      expect(teamAI['getRoleForPosition']('ST1', 'defensive')).toBe('Target Man');
      expect(teamAI['getRoleForPosition']('ST1', 'balanced')).toBe('Advanced Forward');
      expect(teamAI['getRoleForPosition']('ST1', 'attacking')).toBe('Complete Forward');
    });

    it('returns Natural for unknown position', () => {
      expect(teamAI['getRoleForPosition']('UNKNOWN', 'balanced')).toBe('Natural');
    });
  });

  describe('replacePlayer', () => {
    it('returns false if playerOut not in lineup', () => {
      expect(teamAI.replacePlayer(999, 2)).toBe(false);
    });

    it('returns false if playerIn not found', () => {
      expect(teamAI.replacePlayer(1, 999)).toBe(false);
    });

    it('returns false if playerIn already on field', () => {
      expect(teamAI.replacePlayer(1, 2)).toBe(false);
    });

    it('substitutes successfully', () => {
      expect(teamAI.replacePlayer(1, 12)).toBe(true);
      const lineup = teamAI.getStartingXI();
      expect(lineup.find((p) => p.position === 'GK')?.playerId).toBe(12);
    });
  });

  describe('getAvailableSubstitutes', () => {
    it('returns players not in starting XI', () => {
      const subs = teamAI.getAvailableSubstitutes();
      expect(subs.length).toBe(1);
      expect(subs[0].id).toBe(12);
    });
  });

  describe('shouldSubstitute', () => {
    const makeContext = (overrides: any = {}): any => ({
      minute: 70,
      homeScore: 0,
      awayScore: 0,
      isHomeTeam: true,
      formation: '4-4-2',
      mentality: 'balanced',
      pressingIntensity: 'medium',
      passingStyle: 'mixed',
      ...overrides,
    });

    it('returns null when max substitutions reached', () => {
      (teamAI as any).substitutions = 5;
      expect(teamAI.shouldSubstitute(makeContext({}), new Map())).toBeNull();
    });

    it('substitutes for fatigue after minute 60', () => {
      const fatigue = new Map([
        [1, 90],
        [2, 10],
      ]);
      const result = teamAI.shouldSubstitute(makeContext({ minute: 70 }), fatigue);
      expect(result?.playerId).toBe(1);
      expect(result?.reason).toBe('fatigue');
    });

    it('no fatigue sub before minute 60', () => {
      const fatigue = new Map([[1, 90]]);
      expect(teamAI.shouldSubstitute(makeContext({ minute: 50 }), fatigue)).toBeNull();
    });

    it('tactical sub to attack when losing close after 75', () => {
      const result = teamAI.shouldSubstitute(
        makeContext({ minute: 80, homeScore: 0, awayScore: 1 }),
        new Map()
      );
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('attack');
    });

    it('tactical sub to defend when winning close after 75', () => {
      const result = teamAI.shouldSubstitute(
        makeContext({ minute: 80, homeScore: 1, awayScore: 0 }),
        new Map()
      );
      expect(result).not.toBeNull();
      expect(result?.reason).toContain('defense');
    });

    it('no tactical sub when losing by many', () => {
      expect(
        teamAI.shouldSubstitute(makeContext({ minute: 80, homeScore: 0, awayScore: 3 }), new Map())
      ).toBeNull();
    });

    it('no tactical sub when winning by many', () => {
      expect(
        teamAI.shouldSubstitute(makeContext({ minute: 80, homeScore: 3, awayScore: 0 }), new Map())
      ).toBeNull();
    });

    it('no tactical sub before minute 75', () => {
      expect(
        teamAI.shouldSubstitute(makeContext({ minute: 70, homeScore: 0, awayScore: 1 }), new Map())
      ).toBeNull();
    });
  });

  describe('substitution tracking', () => {
    it('tracks substitutions correctly', () => {
      expect(teamAI.getRemainingSubstitutions()).toBe(5);
      teamAI.recordSubstitution();
      expect(teamAI.getRemainingSubstitutions()).toBe(4);
    });
  });

  describe('updateTactics', () => {
    it('updates tactics', () => {
      teamAI.updateTactics({ mentality: 'attacking' });
      expect(teamAI.getTactics().mentality).toBe('attacking');
    });

    it('reselects starting XI on formation change', () => {
      const originalXI = teamAI.getStartingXI();
      teamAI.updateTactics({ formation: '3-5-2' });
      const newXI = teamAI.getStartingXI();
      expect(newXI.length).toBe(11);
      const defenders = newXI.filter((p) => p.position.includes('CB'));
      expect(defenders.length).toBe(3);
    });
  });

  describe('setLineup', () => {
    it('overrides current lineup', () => {
      const newLineup = [
        { playerId: 1, position: 'GK', role: 'Goalkeeper' },
        { playerId: 2, position: 'CB1', role: 'Central Defender' },
      ];
      teamAI.setLineup(newLineup);
      expect(teamAI.getStartingXI()).toEqual(newLineup);
    });
  });
});
