import { Competition } from '../models/Competition';
import { Team } from '../models/Team';
import { Match } from '../models/Match';
import { FixtureGenerator } from './FixtureGenerator';
import { Calendar } from './Calendar';
import { LeagueTable } from './LeagueTable';

/**
 * Main manager for competition system
 * Orchestrates fixture generation, calendar management, and standings
 */
export class CompetitionManager {
  private competitions: Map<number, Competition> = new Map();
  private teams: Map<number, Team> = new Map();
  private calendar: Calendar;
  private leagueTables: Map<number, LeagueTable> = new Map();

  constructor(seasonStart: string, seasonEnd: string) {
    this.calendar = new Calendar(seasonStart, seasonEnd);
  }

  /**
   * Initialize competitions with teams
   */
  initialize(competitions: Competition[], teams: Team[]): void {
    // Store competitions
    competitions.forEach((c) => {
      this.competitions.set(c.id, c);
    });

    // Store teams
    teams.forEach((t) => {
      this.teams.set(t.id, t);
    });

    // Generate fixtures and schedule
    competitions.forEach((competition) => {
      const competitionTeams = competition.teams
        .map((id) => teams.find((t) => t.id === id))
        .filter((t): t is Team => t !== undefined);

      const matches = FixtureGenerator.generate(competition, competitionTeams);
      this.calendar.scheduleCompetition(competition, matches);

      // Initialize league table for league-type competitions
      if (competition.format === 'round_robin' || competition.format === 'hybrid') {
        this.leagueTables.set(competition.id, new LeagueTable(competition, competitionTeams));
      }
    });
  }

  /**
   * Get a competition by ID
   */
  getCompetition(id: number): Competition | undefined {
    return this.competitions.get(id);
  }

  /**
   * Get all competitions
   */
  getAllCompetitions(): Competition[] {
    return Array.from(this.competitions.values());
  }

  /**
   * Get teams in a competition
   */
  getCompetitionTeams(competitionId: number): Team[] {
    const competition = this.competitions.get(competitionId);
    if (!competition) return [];

    return competition.teams
      .map((id) => this.teams.get(id))
      .filter((t): t is Team => t !== undefined);
  }

  /**
   * Get matches for a competition
   */
  getCompetitionMatches(competitionId: number): Match[] {
    return this.calendar.getCompetitionMatches(competitionId);
  }

  /**
   * Get upcoming matches for a team across all competitions
   */
  getUpcomingMatchesForTeam(teamId: number, daysAhead: number = 30): Match[] {
    return this.calendar.getUpcomingMatches(teamId, daysAhead);
  }

  /**
   * Get past matches for a team
   */
  getPastMatchesForTeam(teamId: number): Match[] {
    return this.calendar.getPastMatches(teamId);
  }

  /**
   * Get league table for a competition
   */
  getLeagueTable(competitionId: number): ReturnType<LeagueTable['getTable']> | null {
    const table = this.leagueTables.get(competitionId);
    return table ? table.getTable() : null;
  }

  /**
   * Update match result and standings
   */
  recordMatchResult(matchId: number, homeScore: number, awayScore: number): void {
    const match = this.calendar.getMatches().find((m) => m.id === matchId);
    if (!match) {
      throw new Error(`Match ${matchId} not found`);
    }

    // Update match with score
    match.score = { home: homeScore, away: awayScore };
    match.status = 'completed';

    // Update league table if applicable
    const competition = this.competitions.get(match.competitionId);
    const table = this.leagueTables.get(match.competitionId);

    if (
      competition &&
      table &&
      (competition.format === 'round_robin' || competition.format === 'hybrid')
    ) {
      table.updateFromMatch(match);
    }

    // TODO: Handle knockout progression
  }

  /**
   * Get qualification results for a competition
   */
  getQualifications(competitionId: number): ReturnType<LeagueTable['getQualifications']> | null {
    const table = this.leagueTables.get(competitionId);
    return table ? table.getQualifications() : null;
  }

  /**
   * Get relegated teams for a competition
   */
  getRelegations(competitionId: number): number[] | null {
    const table = this.leagueTables.get(competitionId);
    return table ? table.getRelegations() : null;
  }

  /**
   * Get calendar view
   */
  getCalendarView(startDate: Date, endDate: Date): ReturnType<Calendar['getCalendarView']> {
    return this.calendar.getCalendarView(startDate, endDate);
  }

  /**
   * Check team availability on a date
   */
  isTeamAvailable(teamId: number, date: string): boolean {
    return this.calendar.isTeamAvailable(teamId, date);
  }

  /**
   * Set team unavailability (international duty, etc.)
   */
  setTeamUnavailable(teamId: number, dates: string[]): void {
    this.calendar.setTeamUnavailable(teamId, dates);
  }

  /**
   * Get next match for a team
   */
  getNextMatchForTeam(teamId: number): Match | null {
    return this.calendar.getNextMatchDay(teamId);
  }

  /**
   * Get competition by team
   */
  getTeamCompetitions(teamId: number): Competition[] {
    return this.getAllCompetitions().filter((c) => c.teams.includes(teamId));
  }

  /**
   * Get all matches in the calendar
   */
  getAllMatches(): Match[] {
    return this.calendar.getMatches();
  }

  /**
   * Get season dates
   */
  getSeasonStart(): Date {
    return this.calendar.getSeasonStart();
  }

  getSeasonEnd(): Date {
    return this.calendar.getSeasonEnd();
  }

  /**
   * Simulate progression to next season (update competitions)
   */
  advanceSeason(newSeason: string, newTeams?: Team[], newCompetitions?: Competition[]): void {
    // Handle promotions/relegations
    const newSeasonStart = `${newSeason}-08-01`;
    const newSeasonEnd = `${parseInt(newSeason) + 1}-05-31`;

    if (newCompetitions && newTeams) {
      this.initialize(newCompetitions, newTeams);
      this.calendar.advanceSeason(newSeasonStart, newSeasonEnd);
    } else {
      // Keep same competitions but regenerate fixtures with updated team lists
      this.calendar.advanceSeason(newSeasonStart, newSeasonEnd);
      // Re-initialize would be needed here
    }
  }
}
