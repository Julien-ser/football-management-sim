import { Team } from '../models/Team';
import { Match } from '../models/Match';
import { Competition, GroupStanding, QualificationSpot, Tiebreaker } from '../models/Competition';

/**
 * Manages league standings and table calculations
 */
export class LeagueTable {
  private standings: Map<number, TeamStanding> = new Map();
  private competition: Competition;
  private teams: Map<number, Team> = new Map();
  private rules: {
    pointsPerWin: number;
    pointsPerDraw: number;
    pointsPerLoss: number;
    tiebreakers: Tiebreaker[];
  };

  constructor(competition: Competition, teams: Team[]) {
    this.competition = competition;
    this.rules = {
      pointsPerWin: competition.rules.pointsPerWin,
      pointsPerDraw: competition.rules.pointsPerDraw,
      pointsPerLoss: competition.rules.pointsPerLoss,
      tiebreakers: competition.rules.tiebreakers,
    };

    // Initialize standings for all teams
    competition.teams.forEach((teamId) => {
      const team = teams.find((t) => t.id === teamId);
      if (team) {
        this.teams.set(teamId, team);
        this.standings.set(teamId, {
          teamId,
          played: 0,
          won: 0,
          drawn: 0,
          lost: 0,
          goalsFor: 0,
          goalsAgainst: 0,
          points: 0,
        });
      }
    });
  }

  /**
   * Update standings based on a completed match
   */
  updateFromMatch(match: Match): void {
    if (!match.score) return;

    const homeStanding = this.standings.get(match.homeTeamId);
    const awayStanding = this.standings.get(match.awayTeamId);

    if (!homeStanding || !awayStanding) return;

    // Update matches played
    homeStanding.played++;
    awayStanding.played++;

    // Update goals
    homeStanding.goalsFor += match.score.home;
    homeStanding.goalsAgainst += match.score.away;
    awayStanding.goalsFor += match.score.away;
    awayStanding.goalsAgainst += match.score.home;

    // Update results and points
    if (match.score.home > match.score.away) {
      homeStanding.won++;
      homeStanding.points += this.rules.pointsPerWin;
      awayStanding.lost++;
      awayStanding.points += this.rules.pointsPerLoss;
    } else if (match.score.home < match.score.away) {
      awayStanding.won++;
      awayStanding.points += this.rules.pointsPerWin;
      homeStanding.lost++;
      homeStanding.points += this.rules.pointsPerLoss;
    } else {
      homeStanding.drawn++;
      homeStanding.points += this.rules.pointsPerDraw;
      awayStanding.drawn++;
      awayStanding.points += this.rules.pointsPerDraw;
    }
  }

  /**
   * Get sorted standings table
   */
  getTable(): TeamStanding[] {
    const table = Array.from(this.standings.values());
    return this.sortStandings(table);
  }

  /**
   * Get position for a specific team
   */
  getPosition(teamId: number): number {
    const sorted = this.getTable();
    const index = sorted.findIndex((s) => s.teamId === teamId);
    return index + 1;
  }

  /**
   * Get team standing
   */
  getStanding(teamId: number): TeamStanding | undefined {
    return this.standings.get(teamId);
  }

  /**
   * Get qualification results for this season
   */
  getQualifications(): QualificationResult[] {
    const table = this.getTable();
    const results: QualificationResult[] = [];

    this.competition.rules.qualificationSpots.forEach((spot) => {
      if (spot.position <= table.length) {
        const team = table[spot.position - 1];
        results.push({
          teamId: team.teamId,
          competitionType: spot.competitionType,
          competitionId: spot.competitionId,
          stage: spot.stage,
          position: spot.position,
        });
      }
    });

    return results;
  }

  /**
   * Get relegated teams
   */
  getRelegations(): number[] {
    const table = this.getTable();
    const relegated: number[] = [];

    // relegationSpots at bottom of table
    for (let i = table.length - this.competition.rules.relegationSpots; i < table.length; i++) {
      if (i >= 0) {
        relegated.push(table[i].teamId);
      }
    }

    return relegated.sort((a, b) => {
      const standA = this.standings.get(a);
      const standB = this.standings.get(b);
      if (!standA || !standB) return 0;
      // If tied on points, apply tiebreakers
      if (standA.points === standB.points) {
        return this.applyTiebreakers(standA, standB);
      }
      return standA.points - standB.points; // Lower points means worse position
    });
  }

  /**
   * Apply tiebreakers to determine ordering
   */
  private sortStandings(table: TeamStanding[]): TeamStanding[] {
    return table.sort((a, b) => {
      // Primary: points (descending)
      if (a.points !== b.points) {
        return b.points - a.points;
      }

      // Apply tiebreakers
      return this.applyTiebreakers(a, b);
    });
  }

  /**
   * Apply tiebreaker rules to two teams
   */
  private applyTiebreakers(a: TeamStanding, b: TeamStanding): number {
    for (const tb of this.rules.tiebreakers) {
      let diff = 0;

      switch (tb.criterion) {
        case 'goal_difference':
          diff = a.goalsFor - a.goalsAgainst - (b.goalsFor - b.goalsAgainst);
          break;
        case 'goals_scored':
          diff = a.goalsFor - b.goalsFor;
          break;
        case 'head_to_head':
          // Would need head-to-head results - not implemented here
          diff = 0;
          break;
        default:
          diff = 0;
      }

      if (diff !== 0) {
        return tb.descending ? -diff : diff;
      }
    }

    return 0;
  }

  /**
   * Get all standings
   */
  getAllStandings(): TeamStanding[] {
    return Array.from(this.standings.values());
  }

  /**
   * Reset standings
   */
  reset(): void {
    this.standings.forEach((standing) => {
      standing.played = 0;
      standing.won = 0;
      standing.drawn = 0;
      standing.lost = 0;
      standing.goalsFor = 0;
      standing.goalsAgainst = 0;
      standing.points = 0;
    });
  }
}

export interface TeamStanding {
  teamId: number;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface QualificationResult {
  teamId: number;
  competitionType: string;
  competitionId?: number;
  stage: string;
  position: number;
}
