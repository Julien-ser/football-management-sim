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

describe('TransferAI Workflow', () => {
  it('should execute full transfer workflow: identify needs, pursue target, and list surplus', async () => {
    const aiTeam: Team = {
      id: 100,
      name: 'AI Team',
      shortName: 'AI',
      stadium: 'AI Stadium',
      capacity: 50000,
      leagueId: 1,
      manager: 'AI Manager',
      budget: 200000000,
      players: [],
    };
    const otherTeam: Team = {
      id: 101,
      name: 'Selling Team',
      shortName: 'ST',
      stadium: 'ST Stadium',
      capacity: 50000,
      leagueId: 1,
      manager: 'Seller',
      budget: 100000000,
      players: [],
    };
    const teams: Team[] = [aiTeam, otherTeam];

    const players: Player[] = [
      createTestPlayer(200, 100, 'defensive-midfielder', 75),
      createTestPlayer(201, 100, 'central-midfielder', 76),
      createTestPlayer(202, 100, 'attacking-midfielder', 77),
      createTestPlayer(203, 100, 'right-winger', 78),
      createTestPlayer(204, 100, 'left-winger', 79),
      createTestPlayer(205, 100, 'striker', 90),
      createTestPlayer(206, 100, 'striker', 85),
      createTestPlayer(207, 100, 'striker', 60, 20000, '1990-01-01'),
      createTestPlayer(208, 101, 'goalkeeper', 85, 40000, '1995-01-01'),
      createTestPlayer(209, 101, 'center-back', 70),
    ];
    aiTeam.players = players.filter((p) => p.contract.teamId === 100).map((p) => p.id);
    otherTeam.players = players.filter((p) => p.contract.teamId === 101).map((p) => p.id);

    const transferMarket = new TransferMarket(players, teams);
    transferMarket.listPlayer(208, 100000);

    const scoutManager = new ScoutManager();
    const negotiator = new Negotiator();

    const mockScout: any = {
      scoutPlayer: jest.fn().mockReturnValue({
        overallRating: 85,
        confidence: 0.9,
        strengths: ['shot stopping'],
        weaknesses: [],
        potential: 90,
        estimatedValue: 1500000,
        suggestedBid: 1200000,
      }),
    };
    (scoutManager as any).requestScouting = jest.fn().mockReturnValue(mockScout);

    const randomSpy = jest.spyOn(Math, 'random').mockReturnValue(0.1);

    const transferAI = new TransferAI(
      aiTeam,
      transferMarket,
      scoutManager,
      negotiator,
      players,
      0.5,
      0.5
    );

    const report = await transferAI.performTransferActivity();

    const bidAction = report.actions.find((a) => a.type === 'bid' && a.playerId === 208);
    expect(bidAction).toBeDefined();
    expect(bidAction!.amount).toBeGreaterThan(0);

    const listAction = report.actions.find((a) => a.type === 'list' && a.playerId === 207);
    expect(listAction).toBeDefined();

    randomSpy.mockRestore();
  });
});
