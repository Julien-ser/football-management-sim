import { Competition, CompetitionFormat, GroupStage, GroupStanding } from '../models/Competition';
import { Team } from '../models/Team';
import { Match } from '../models/Match';

/**
 * Generates fixtures for competitions based on their format
 */
export class FixtureGenerator {
  /**
   * Generate all fixtures for a competition
   */
  static generate(competition: Competition, teams: Team[]): Match[] {
    const teamIds = competition.teams;
    const teamMap = new Map(teams.map((t) => [t.id, t]));

    switch (competition.format) {
      case 'round_robin':
        return this.generateRoundRobin(competition, teamIds);
      case 'single_elimination':
        return this.generateSingleElimination(competition, teamIds);
      case 'group_stage_knockout':
        return this.generateGroupStageKnockout(competition, teamIds, teamMap);
      case 'hybrid':
        return this.generateHybrid(competition, teamIds, teamMap);
      default:
        throw new Error(`Unknown competition format: ${competition.format}`);
    }
  }

  /**
   * Generate double round-robin fixtures (home and away)
   */
  private static generateRoundRobin(competition: Competition, teamIds: number[]): Match[] {
    const matches: Match[] = [];
    const n = teamIds.length;
    const totalRounds = (n - 1) * 2; // Double round-robin
    const matchesPerRound = n % 2 === 0 ? n / 2 : (n - 1) / 2;

    // Create schedule using circle method
    const schedule: [number, number][] = [];

    // Fixed team (for odd number of teams)
    let fixed = n % 2 === 0 ? -1 : 0;

    // Generate one round
    for (let round = 0; round < totalRounds / 2; round++) {
      const pairs: [number, number][] = [];
      for (let i = 0; i < n / 2; i++) {
        const home = (i + (i < fixed ? 1 : 0)) % n;
        const away = (n - 1 - i + (i < fixed ? 1 : 0)) % n;
        if (home !== away) {
          pairs.push([teamIds[home], teamIds[away]]);
        }
      }

      // Rotate all except first team
      const rotated = [teamIds[0], ...teamIds.slice(1).reverse()];
      teamIds = this.rotate(rotated, fixed === -1 ? 1 : 2);
    }

    // Now generate actual matches with home/away reversal
    const allTeamIds = competition.teams; // Reset to original order
    const halfLength = Math.floor((allTeamIds.length - 1) / 2);

    for (let round = 0; round < allTeamIds.length - 1; round++) {
      for (let i = 0; i < halfLength; i++) {
        const homeIdx = i + (i === 0 && allTeamIds.length % 2 === 0 ? 1 : 0);
        const awayIdx = allTeamIds.length - 1 - i;

        const homeTeam = allTeamIds[homeIdx];
        const awayTeam = allTeamIds[awayIdx];

        // First leg
        matches.push({
          id: this.generateMatchId(competition, round * 2 + 1, i),
          homeTeamId: homeTeam,
          awayTeamId: awayTeam,
          competitionId: competition.id,
          date: this.computeDate(competition.seasonStartDate, round * 7 * 2), // Weekly matches
          venue: '', // To be filled with actual stadium
          status: 'scheduled',
          events: [],
          statistics: undefined,
        });

        // Second leg (reverse fixture)
        matches.push({
          id: this.generateMatchId(competition, round * 2 + 2, i),
          homeTeamId: awayTeam,
          awayTeamId: homeTeam,
          competitionId: competition.id,
          date: this.computeDate(competition.seasonStartDate, round * 7 * 2 + 7), // Next week
          venue: '',
          status: 'scheduled',
          events: [],
          statistics: undefined,
        });
      }
    }

    return matches;
  }

  /**
   * Generate single elimination knockout fixtures
   */
  private static generateSingleElimination(competition: Competition, teamIds: number[]): Match[] {
    const matches: Match[] = [];
    const rounds = Math.ceil(Math.log2(teamIds.length));
    const byes = Math.pow(2, rounds) - teamIds.length;

    // Shuffle teams for random draw
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);

    // First round pairs
    const firstRoundPairs: [number, number][] = [];
    let teamIndex = 0;

    // Give byes to first 'byes' teams
    const teamsWithByes = shuffled.slice(0, byes);

    // Pair remaining teams
    for (let i = byes; i < teamIds.length; i += 2) {
      if (i + 1 < teamIds.length) {
        firstRoundPairs.push([shuffled[i], shuffled[i + 1]]);
      }
    }

    // Generate matches round by round
    let currentPairs = firstRoundPairs;
    let roundNumber = 1;
    let matchCounter = 0;

    while (currentPairs.length > 0) {
      const nextRoundPairs: [number, number][] = [];

      for (let i = 0; i < currentPairs.length; i++) {
        const [home, away] = currentPairs[i];

        matches.push({
          id: this.generateMatchId(competition, roundNumber, i),
          homeTeamId: home,
          awayTeamId: away,
          competitionId: competition.id,
          date: this.computeDate(competition.seasonStartDate, matchCounter * 7 * 2), // Bi-weekly
          venue: '',
          status: 'scheduled',
          events: [],
          statistics: undefined,
        });

        matchCounter++;

        // Winner advances (placeholder - actual winner determined after match)
        nextRoundPairs.push([home, away]); // Placeholder
      }

      currentPairs = this.pairNextRound(nextRoundPairs);
      roundNumber++;
    }

    return matches;
  }

  /**
   * Generate group stage followed by knockout (European competitions)
   */
  private static generateGroupStageKnockout(
    competition: Competition,
    teamIds: number[],
    teamMap: Map<number, Team>
  ): Match[] {
    const matches: Match[] = [];

    // 1. Group Stage (32 teams -> 8 groups of 4)
    const groups: GroupStage[] = [];
    const shuffled = [...teamIds].sort(() => Math.random() - 0.5);
    const groupSize = 4;
    const numGroups = shuffled.length / groupSize;

    for (let g = 0; g < numGroups; g++) {
      const groupTeams = shuffled.slice(g * groupSize, (g + 1) * groupSize);
      const groupMatches: number[] = [];
      const standings: GroupStanding[] = groupTeams.map((teamId) => ({
        teamId,
        played: 0,
        won: 0,
        drawn: 0,
        lost: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        points: 0,
      }));

      // Double round-robin within group (home and away)
      for (let i = 0; i < groupTeams.length; i++) {
        for (let j = i + 1; j < groupTeams.length; j++) {
          const home = groupTeams[i];
          const away = groupTeams[j];

          // First leg
          const match1Id = this.generateMatchId(competition, g * 10 + i * 2 + 1, j);
          matches.push({
            id: match1Id,
            homeTeamId: home,
            awayTeamId: away,
            competitionId: competition.id,
            date: this.computeDate(competition.seasonStartDate, g * 30 + i * 14),
            venue: '',
            status: 'scheduled',
            events: [],
            statistics: undefined,
          });
          groupMatches.push(match1Id);

          // Second leg
          const match2Id = this.generateMatchId(competition, g * 10 + i * 2 + 2, j);
          matches.push({
            id: match2Id,
            homeTeamId: away,
            awayTeamId: home,
            competitionId: competition.id,
            date: this.computeDate(competition.seasonStartDate, g * 30 + i * 14 + 7),
            venue: '',
            status: 'scheduled',
            events: [],
            statistics: undefined,
          });
          groupMatches.push(match2Id);
        }
      }

      groups.push({
        groupId: `Group ${String.fromCharCode(65 + g)}`,
        teams: groupTeams,
        matches: groupMatches,
        standings,
      });
    }

    // 2. Knockout Stage (Round of 16 -> QF -> SF -> Final)
    // In a real implementation, we'd need to determine qualifiers from groups
    // For now, we'll generate template matches with placeholder teams

    const knockoutMatches = this.generateKnockoutTemplate(competition, groups);
    matches.push(...knockoutMatches);

    // Store groups in stages
    competition.stages = [
      {
        id: 'group_stage',
        name: 'Group Stage',
        type: 'group_stage',
        order: 1,
        groups,
      },
      {
        id: 'round_of_16',
        name: 'Round of 16',
        type: 'round_of_16',
        order: 2,
        fixturePairs: [],
      },
      {
        id: 'quarter_final',
        name: 'Quarter-Finals',
        type: 'quarter_final',
        order: 3,
        fixturePairs: [],
      },
      {
        id: 'semi_final',
        name: 'Semi-Finals',
        type: 'semi_final',
        order: 4,
        fixturePairs: [],
      },
      {
        id: 'final',
        name: 'Final',
        type: 'final',
        order: 5,
        fixturePairs: [],
      },
    ];

    return matches;
  }

  /**
   * Generate knockout stage template (placeholders for group winners/runners)
   */
  private static generateKnockoutTemplate(competition: Competition, groups: GroupStage[]): Match[] {
    const matches: Match[] = [];
    let matchIdCounter = 1000;

    // Round of 16: 16 teams (8 group winners vs 8 runners-up)
    for (let i = 0; i < 8; i++) {
      matches.push({
        id: matchIdCounter++,
        homeTeamId: 0, // Placeholder: Winner Group X
        awayTeamId: 0, // Placeholder: Runner-up Group Y
        competitionId: competition.id,
        date: this.computeDate(competition.seasonStartDate, 70 + i * 14), // After group stage
        venue: '',
        status: 'scheduled',
        events: [],
        statistics: undefined,
      });
    }

    // Quarter-finals
    for (let i = 0; i < 4; i++) {
      matches.push({
        id: matchIdCounter++,
        homeTeamId: 0,
        awayTeamId: 0,
        competitionId: competition.id,
        date: this.computeDate(competition.seasonStartDate, 84 + i * 14),
        venue: '',
        status: 'scheduled',
        events: [],
        statistics: undefined,
      });
    }

    // Semi-finals
    for (let i = 0; i < 2; i++) {
      matches.push({
        id: matchIdCounter++,
        homeTeamId: 0,
        awayTeamId: 0,
        competitionId: competition.id,
        date: this.computeDate(competition.seasonStartDate, 98 + i * 14),
        venue: '',
        status: 'scheduled',
        events: [],
        statistics: undefined,
      });
    }

    // Final
    matches.push({
      id: matchIdCounter++,
      homeTeamId: 0,
      awayTeamId: 0,
      competitionId: competition.id,
      date: this.computeDate(competition.seasonStartDate, 112), // ~May
      venue: 'Neutral Venue', // Typically neutral for finals
      status: 'scheduled',
      events: [],
      statistics: undefined,
    });

    return matches;
  }

  /**
   * Generate hybrid format (multiple phases)
   */
  private static generateHybrid(
    competition: Competition,
    teamIds: number[],
    teamMap: Map<number, Team>
  ): Match[] {
    // Implement based on specific hybrid requirements
    return this.generateGroupStageKnockout(competition, teamIds, teamMap);
  }

  /**
   * Helper: Rotate array for round-robin algorithm
   */
  private static rotate(arr: number[], positions: number): number[] {
    const removed = arr.splice(0, positions);
    return arr.concat(removed);
  }

  /**
   * Helper: Generate unique match ID
   */
  private static generateMatchId(competition: Competition, round: number, match: number): number {
    return competition.id * 10000 + round * 100 + match;
  }

  /**
   * Helper: Compute match date from season start
   */
  private static computeDate(seasonStart: string, daysAfter: number): string {
    const start = new Date(seasonStart);
    start.setDate(start.getDate() + daysAfter);
    return start.toISOString().split('T')[0];
  }

  /**
   * Pair teams for next knockout round
   */
  private static pairNextRound(pairs: [number, number][]): [number, number][] {
    const next: [number, number][] = [];
    for (let i = 0; i < pairs.length; i += 2) {
      if (i + 1 < pairs.length) {
        next.push([pairs[i][0], pairs[i + 1][1]]); // Winner of first vs Winner of second
      }
    }
    return next;
  }
}
