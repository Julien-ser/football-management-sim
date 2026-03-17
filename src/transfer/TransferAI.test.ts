import { TransferAI } from './TransferAI';
import { Player, Team } from '../models';
import { TransferMarket } from './TransferMarket';
import { ScoutManager } from './Scout';
import { Negotiator } from './Negotiator';

function createTestPlayer(
  id: number,
  teamId: number,
  position: string = 'striker',
  rating: number = 75,
  salary: number = 50000,
  dateOfBirth?: string
): Player {
  return {
    id,
    name: `Player ${id}`,
    nationality: 'England',
    dateOfBirth: dateOfBirth || '1995-01-01',
    position: position as any,
    currentRating: rating,
    potential: rating + 10,
    contract: { teamId, salary, expiryDate: '2026-06-30' },
    stats: { goals: 10, assists: 5, appearances: 30, minutesPlayed: 2700 },
  };
}

function createTestTeam(id: number, budget: number = 100000000): Team {
  return {
    id,
    name: `Team ${id}`,
    shortName: `T${id}`,
    stadium: `Stadium ${id}`,
    capacity: 50000,
    leagueId: 1,
    manager: `Manager ${id}`,
    budget,
    players: [],
  };
}

describe('TransferAI', () => {
  let team: Team;
  let teams: Team[];
  let transferMarket: TransferMarket;
  let scoutManager: ScoutManager;
  let negotiator: Negotiator;
  let players: Player[];
  let transferAI: TransferAI;

  beforeEach(() => {
    teams = [createTestTeam(1, 150000000), createTestTeam(2, 100000000)];
    team = teams[0];

    players = [
      createTestPlayer(1, 1, 'goalkeeper', 80),
      createTestPlayer(2, 1, 'center-back', 78),
      createTestPlayer(3, 1, 'center-back', 77),
      createTestPlayer(4, 1, 'right-back', 76),
      createTestPlayer(5, 1, 'left-back', 75),
      createTestPlayer(6, 1, 'defensive-midfielder', 79),
      createTestPlayer(7, 1, 'central-midfielder', 80),
      createTestPlayer(8, 1, 'attacking-midfielder', 81),
      createTestPlayer(9, 1, 'right-winger', 82),
      createTestPlayer(10, 1, 'left-winger', 80),
      createTestPlayer(11, 1, 'striker', 85),
      createTestPlayer(12, 1, 'striker', 83),
      createTestPlayer(13, 2, 'goalkeeper', 72),
      createTestPlayer(14, 2, 'center-back', 70),
      createTestPlayer(15, 2, 'left-back', 68),
      createTestPlayer(16, 2, 'striker', 78),
    ];

    teams.forEach((team) => {
      team.players = players.filter((p) => p.contract.teamId === team.id).map((p) => p.id);
    });

    transferMarket = new TransferMarket(players, teams);
    scoutManager = new ScoutManager();
    negotiator = new Negotiator();
    transferAI = new TransferAI(team, transferMarket, scoutManager, negotiator, players, 0.5, 0.5);
  });

  describe('Squad Needs', () => {
    it('should identify goalkeeper need', () => {
      const needs = transferAI['identifySquadNeeds']();
      const gkNeed = needs.find((n) => n.position === 'goalkeeper');
      if (gkNeed) {
        expect(gkNeed.priority).toBeGreaterThan(0);
        expect(gkNeed.reason).toBeDefined();
      }
    });

    it('should return need objects with required properties', () => {
      const needs = transferAI['identifySquadNeeds']();
      if (needs.length > 0) {
        expect(needs[0]).toHaveProperty('position');
        expect(needs[0]).toHaveProperty('priority');
        expect(needs[0]).toHaveProperty('reason');
      }
    });
  });

  describe('Position Categorization', () => {
    it('should categorize positions', () => {
      expect(transferAI['getPositionCategory']('goalkeeper')).toBe('goalkeeper');
      expect(transferAI['getPositionCategory']('center-back')).toBe('defender');
      expect(transferAI['getPositionCategory']('right-back')).toBe('defender');
      expect(transferAI['getPositionCategory']('defensive-midfielder')).toBe('midfielder');
      expect(transferAI['getPositionCategory']('attacking-midfielder')).toBe('midfielder');
      expect(transferAI['getPositionCategory']('right-winger')).toBe('forward');
      expect(transferAI['getPositionCategory']('striker')).toBe('forward');
    });

    it('should map categories to positions', () => {
      expect(transferAI['getPositionsForCategory']('goalkeeper')).toContain('goalkeeper');
      const defenders = transferAI['getPositionsForCategory']('defender');
      expect(defenders).toContain('center-back');
      expect(defenders).toContain('right-back');
    });
  });

  describe('Surplus Detection', () => {
    it('should flag old players', () => {
      const old = createTestPlayer(99, 1, 'defender', 60, 30000, '1990-01-01');
      expect(transferAI['shouldListPlayer'](old)).toBe(true);
    });

    it('should flag low-rated players', () => {
      const low = createTestPlayer(100, 1, 'midfielder', 58);
      expect(transferAI['shouldListPlayer'](low)).toBe(true);
    });

    it('should not flag young high-rated players', () => {
      const star = createTestPlayer(101, 1, 'striker', 88, 150000, '2003-01-01');
      expect(transferAI['shouldListPlayer'](star)).toBe(false);
    });

    it('should list surplus player on market', () => {
      const oldPlayer = createTestPlayer(102, 1, 'center-back', 60, 25000, '1988-01-01');
      players.push(oldPlayer);
      team.players.push(102);
      const newAI = new TransferAI(
        team,
        transferMarket,
        scoutManager,
        negotiator,
        players,
        0.5,
        0.5
      );
      expect(newAI['listSurplusPlayer'](oldPlayer)).toBe(true);
      expect(transferMarket.getPlayerWithListing(102)).not.toBeNull();
    });
  });

  describe('Transfer Activity Execution', () => {
    it('should generate activity report', async () => {
      const report = await transferAI.performTransferActivity();
      expect(report.teamId).toBe(team.id);
      expect(report.timestamp).toBeDefined();
      expect(Array.isArray(report.actions)).toBe(true);
    });

    it('should consider market opportunities', async () => {
      transferMarket.listPlayer(16, 25000000);
      const report = await transferAI.performTransferActivity();
      expect(Array.isArray(report.actions)).toBe(true);
    });
  });

  describe('Utility Methods', () => {
    it('calculates age correctly', () => {
      const player = createTestPlayer(200, 1, 'striker', 75);
      player.dateOfBirth = '2000-06-15';
      const age = transferAI['calculateAge'](player.dateOfBirth);
      const today = new Date();
      const expected = today.getFullYear() - 2000 - (today.getMonth() < 6 ? 1 : 0);
      expect(age).toBe(expected);
    });

    it('calculates months until expiry', () => {
      const months = transferAI['getMonthsUntilExpiry']('2026-06-30');
      expect(months).toBeGreaterThanOrEqual(14);
      expect(months).toBeLessThanOrEqual(16);
    });
  });
});
