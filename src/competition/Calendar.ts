import { Match } from '../models/Match';
import { Competition } from '../models/Competition';
import { Player } from '../models/Player';

/**
 * Manages the competition calendar, scheduling, and team availability
 */
export class Calendar {
  private matches: Match[] = [];
  private competitions: Map<number, Competition> = new Map();
  private seasonStart: Date;
  private seasonEnd: Date;
  private teamAvailability: Map<number, Set<string>> = new Map(); // teamId -> Set of unavailable date strings

  constructor(seasonStart: string, seasonEnd: string) {
    this.seasonStart = new Date(seasonStart);
    this.seasonEnd = new Date(seasonEnd);
  }

  /**
   * Add a competition to the calendar
   */
  addCompetition(competition: Competition): void {
    this.competitions.set(competition.id, competition);
  }

  /**
   * Schedule all matches for a competition
   */
  scheduleCompetition(competition: Competition, matches: Match[]): void {
    this.addCompetition(competition);

    // Add matches to calendar
    matches.forEach((match) => {
      // Check for conflicts with other competitions
      if (this.hasConflict(match)) {
        console.warn(
          `Conflict detected for ${match.homeTeamId} vs ${match.awayTeamId} on ${match.date}`
        );
      }
      this.matches.push(match);
    });

    // Update competition's matches list
    competition.matches = matches.map((m) => m.id);
  }

  /**
   * Get all matches in the calendar
   */
  getMatches(): Match[] {
    return [...this.matches].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }

  /**
   * Get matches for a specific team
   */
  getTeamMatches(teamId: number, startDate?: Date, endDate?: Date): Match[] {
    return this.matches
      .filter((match) => {
        const matchDate = new Date(match.date);
        const isTeamPlaying = match.homeTeamId === teamId || match.awayTeamId === teamId;
        const inDateRange =
          (!startDate || matchDate >= startDate) && (!endDate || matchDate <= endDate);
        return isTeamPlaying && inDateRange;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  /**
   * Get upcoming matches for a team
   */
  getUpcomingMatches(teamId: number, daysAhead: number = 30): Match[] {
    const now = new Date();
    const futureLimit = new Date();
    futureLimit.setDate(now.getDate() + daysAhead);

    return this.getTeamMatches(teamId, now, futureLimit);
  }

  /**
   * Check if a team is available on a specific date
   */
  isTeamAvailable(teamId: number, date: string): boolean {
    const unavailable = this.teamAvailability.get(teamId);
    return !unavailable || !unavailable.has(date);
  }

  /**
   * Mark a team as unavailable on specific dates (e.g., international duty, injuries)
   */
  setTeamUnavailable(teamId: number, dates: string[]): void {
    if (!this.teamAvailability.has(teamId)) {
      this.teamAvailability.set(teamId, new Set());
    }
    const unavailable = this.teamAvailability.get(teamId)!;
    dates.forEach((date) => unavailable.add(date));
  }

  /**
   * Mark a team as available on specific dates
   */
  setTeamAvailable(teamId: number, dates: string[]): void {
    const unavailable = this.teamAvailability.get(teamId);
    if (unavailable) {
      dates.forEach((date) => unavailable.delete(date));
    }
  }

  /**
   * Get calendar view for a date range
   */
  getCalendarView(startDate: Date, endDate: Date): CalendarDay[] {
    const view: CalendarDay[] = [];
    const current = new Date(startDate);

    while (current <= endDate) {
      const dateStr = current.toISOString().split('T')[0];
      const dayMatches = this.matches.filter((m) => m.date === dateStr);

      view.push({
        date: dateStr,
        matches: dayMatches,
        totalMatches: dayMatches.length,
      });

      current.setDate(current.getDate() + 1);
    }

    return view;
  }

  /**
   * Check for match conflicts (same team playing multiple matches on same day)
   */
  private hasConflict(newMatch: Match): boolean {
    const date = newMatch.date;

    // Check if home team already has a match on this date
    const homeConflict = this.matches.some(
      (m) =>
        m.date === date &&
        (m.homeTeamId === newMatch.homeTeamId || m.awayTeamId === newMatch.homeTeamId)
    );

    // Check if away team already has a match on this date
    const awayConflict = this.matches.some(
      (m) =>
        m.date === date &&
        (m.homeTeamId === newMatch.awayTeamId || m.awayTeamId === newMatch.awayTeamId)
    );

    return homeConflict || awayConflict;
  }

  /**
   * Get next match day for a team
   */
  getNextMatchDay(teamId: number): Match | null {
    const upcoming = this.getUpcomingMatches(teamId, 365);
    return upcoming.length > 0 ? upcoming[0] : null;
  }

  /**
   * Get previous matches for a team
   */
  getPastMatches(teamId: number, startDate?: Date): Match[] {
    const now = new Date();
    const pastStart = startDate || new Date(0); // Unix epoch
    const pastMatches = this.getTeamMatches(teamId, pastStart, now);
    return pastMatches.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  /**
   * Get matches for a competition
   */
  getCompetitionMatches(competitionId: number): Match[] {
    return this.matches.filter((m) => m.competitionId === competitionId);
  }

  /**
   * Get season start date
   */
  getSeasonStart(): Date {
    return new Date(this.seasonStart);
  }

  /**
   * Get season end date
   */
  getSeasonEnd(): Date {
    return new Date(this.seasonEnd);
  }

  /**
   * Advance to next season (generate new calendar)
   */
  advanceSeason(newSeasonStart: string, newSeasonEnd: string): void {
    this.matches = [];
    this.teamAvailability.clear();
    this.seasonStart = new Date(newSeasonStart);
    this.seasonEnd = new Date(newSeasonEnd);
  }

  /**
   * Serialize calendar to JSON
   */
  toJSON(): object {
    return {
      seasonStart: this.seasonStart.toISOString(),
      seasonEnd: this.seasonEnd.toISOString(),
      matches: this.matches,
      teamAvailability: Array.from(this.teamAvailability.entries()).reduce(
        (acc, [teamId, dates]) => {
          acc[teamId] = Array.from(dates);
          return acc;
        },
        {} as Record<number, string[]>
      ),
    };
  }

  /**
   * Deserialize calendar from JSON data
   */
  static fromJSON(data: any): Calendar {
    const calendar = new Calendar(data.seasonStart, data.seasonEnd);
    if (data.matches) {
      data.matches.forEach((match: Match) => calendar.matches.push(match));
    }
    if (data.teamAvailability) {
      Object.entries(data.teamAvailability).forEach(([teamId, dates]) => {
        calendar.teamAvailability.set(Number(teamId), new Set(dates as string[]));
      });
    }
    return calendar;
  }
}

export interface CalendarDay {
  date: string;
  matches: Match[];
  totalMatches: number;
}

export interface AvailabilityInfo {
  teamId: number;
  date: string;
  isAvailable: boolean;
  reason?: 'injury' | 'suspension' | 'international' | 'rest';
}
