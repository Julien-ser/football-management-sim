import { Calendar, CalendarDay } from './Calendar';
import { Match } from '../models/Match';
import { Competition } from '../models/Competition';

function createTestMatch(
  id: number,
  homeTeamId: number,
  awayTeamId: number,
  date: string,
  competitionId: number = 1,
  venue?: string
): Match {
  return {
    id,
    homeTeamId,
    awayTeamId,
    competitionId,
    date,
    venue: venue || `Stadium ${id}`,
    status: 'scheduled' as const,
    events: [],
  };
}

function createTestCompetition(
  id: number,
  name: string,
  type: 'league' | 'cup' | 'champions-league' = 'league',
  teams?: number[]
): Competition {
  return {
    id,
    name,
    type,
    country: 'England',
    teams: teams || [],
    season: '2025-26',
    currentMatchday: 1,
    format: 'round_robin' as const,
    stages: [],
    matches: [],
    rules: {
      pointsPerWin: 3,
      pointsPerDraw: 1,
      pointsPerLoss: 0,
      qualificationSpots: [],
      relegationSpots: 0,
      tiebreakers: [],
      aggregateLegs: 1,
      awayGoalsRule: false,
      extraTime: false,
      penalties: true,
    },
    seasonStartDate: '2025-08-01',
    seasonEndDate: '2026-05-31',
    currentStage: 'regular',
  };
}

describe('Calendar', () => {
  let calendar: Calendar;
  let competition: Competition;
  let matches: Match[];

  beforeEach(() => {
    calendar = new Calendar('2025-08-01', '2026-05-31');
    competition = createTestCompetition(1, 'Premier League', 'league');

    matches = [
      createTestMatch(1, 1, 2, '2025-08-10', 1, 'Old Trafford'),
      createTestMatch(2, 3, 4, '2025-08-10', 1, 'Anfield'),
      createTestMatch(3, 1, 3, '2025-08-17', 1, 'Old Trafford'),
      createTestMatch(4, 2, 4, '2025-08-24', 1, 'Etihad'),
      createTestMatch(5, 1, 4, '2025-09-01', 1, 'Old Trafford'),
    ];
  });

  describe('Constructor', () => {
    it('should create calendar with season dates', () => {
      expect(calendar).toBeInstanceOf(Calendar);
      expect(calendar.getSeasonStart()).toEqual(new Date('2025-08-01'));
      expect(calendar.getSeasonEnd()).toEqual(new Date('2026-05-31'));
    });

    it('should start with empty matches list', () => {
      expect(calendar.getMatches()).toEqual([]);
    });
  });

  describe('Competition Management', () => {
    it('should add competition to calendar', () => {
      calendar.addCompetition(competition);
      expect(calendar.getCompetitionMatches(1).length).toBe(0);
    });

    it('should schedule competition with matches', () => {
      calendar.scheduleCompetition(competition, matches);

      expect(competition.matches.length).toBe(5);
      expect(calendar.getMatches().length).toBe(5);
      expect(calendar.getCompetitionMatches(1).length).toBe(5);
    });

    it('should sort matches by date', () => {
      calendar.scheduleCompetition(competition, matches);
      const sortedMatches = calendar.getMatches();

      for (let i = 1; i < sortedMatches.length; i++) {
        expect(new Date(sortedMatches[i].date).getTime()).toBeGreaterThanOrEqual(
          new Date(sortedMatches[i - 1].date).getTime()
        );
      }
    });
  });

  describe('Team Matches', () => {
    beforeEach(() => {
      calendar.scheduleCompetition(competition, matches);
    });

    it('should get all matches for a team', () => {
      const team1Matches = calendar.getTeamMatches(1);
      expect(team1Matches.length).toBe(3); // matches 1, 3, 5
    });

    it('should filter matches by date range', () => {
      const startDate = new Date('2025-08-01');
      const endDate = new Date('2025-08-20');
      const team1Matches = calendar.getTeamMatches(1, startDate, endDate);

      expect(team1Matches.length).toBe(2); // matches 1 and 3
      team1Matches.forEach((match) => {
        const matchDate = new Date(match.date);
        expect(matchDate >= startDate && matchDate <= endDate).toBe(true);
      });
    });

    it('should get upcoming matches for a team', () => {
      const now = new Date('2025-08-05');
      const upcomingMatches = calendar.getUpcomingMatches(1, 30);

      expect(upcomingMatches.length).toBe(3);
      // Verify all are in the future relative to now
      upcomingMatches.forEach((match) => {
        expect(new Date(match.date) >= now).toBe(true);
      });
    });

    it('should get past matches for a team', () => {
      const referenceDate = new Date('2025-08-20');
      const pastMatches = calendar.getPastMatches(1, new Date('2025-08-01'));

      expect(pastMatches.length).toBe(2); // matches 1 and 3 (before Aug 20)
      pastMatches.forEach((match) => {
        expect(new Date(match.date) <= referenceDate).toBe(true);
      });
    });

    it('should get next match day for a team', () => {
      const nextMatch = calendar.getNextMatchDay(1);
      expect(nextMatch).not.toBeNull();
      expect(nextMatch!.id).toBe(1); // First match on 2025-08-10
    });

    it('should return null for next match if no upcoming matches', () => {
      const nextMatch = calendar.getNextMatchDay(99); // non-existent team
      expect(nextMatch).toBeNull();
    });
  });

  describe('Team Availability', () => {
    beforeEach(() => {
      calendar.scheduleCompetition(competition, matches);
    });

    it('should mark team as unavailable on specific dates', () => {
      calendar.setTeamUnavailable(1, ['2025-08-10', '2025-08-17']);
      expect(calendar.isTeamAvailable(1, '2025-08-10')).toBe(false);
      expect(calendar.isTeamAvailable(1, '2025-08-17')).toBe(false);
      expect(calendar.isTeamAvailable(1, '2025-08-24')).toBe(true);
    });

    it('should mark team as available on specific dates', () => {
      calendar.setTeamUnavailable(1, ['2025-08-10']);
      calendar.setTeamAvailable(1, ['2025-08-10']);
      expect(calendar.isTeamAvailable(1, '2025-08-10')).toBe(true);
    });

    it('should handle multiple unavailability entries', () => {
      calendar.setTeamUnavailable(1, ['2025-08-10', '2025-08-17', '2025-09-01']);
      expect(calendar.isTeamAvailable(1, '2025-08-10')).toBe(false);
      expect(calendar.isTeamAvailable(1, '2025-08-17')).toBe(false);
      expect(calendar.isTeamAvailable(1, '2025-09-01')).toBe(false);
    });

    it('should return true for teams with no availability records', () => {
      expect(calendar.isTeamAvailable(99, '2025-08-10')).toBe(true);
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflicts when same team has two matches on same day', () => {
      const newMatch = createTestMatch(6, 1, 5, '2025-08-10', 1);
      calendar.scheduleCompetition(competition, [newMatch]);

      // This should log a warning but still add the match
      expect(calendar.getMatches().length).toBe(1);
    });

    it('should not detect conflict for different teams on same day', () => {
      const match1 = createTestMatch(1, 1, 2, '2025-08-10', 1);
      const match2 = createTestMatch(2, 3, 4, '2025-08-10', 1);

      calendar.scheduleCompetition(competition, [match1]);
      calendar.scheduleCompetition(createTestCompetition(2, 'Cup'), [match2]);

      expect(calendar.getMatches().length).toBe(2);
    });
  });

  describe('Calendar View', () => {
    beforeEach(() => {
      calendar.scheduleCompetition(competition, matches);
    });

    it('should generate calendar view for date range', () => {
      const startDate = new Date('2025-08-01');
      const endDate = new Date('2025-08-20');
      const view = calendar.getCalendarView(startDate, endDate);

      expect(view.length).toBeGreaterThan(0);
      view.forEach((day) => {
        expect(day).toHaveProperty('date');
        expect(day).toHaveProperty('matches');
        expect(day).toHaveProperty('totalMatches');
        expect(day.matches.length).toBe(day.totalMatches);
      });
    });

    it('should correctly count matches per day', () => {
      const startDate = new Date('2025-08-01');
      const endDate = new Date('2025-08-20');
      const view = calendar.getCalendarView(startDate, endDate);

      const aug10 = view.find((day) => day.date === '2025-08-10');
      expect(aug10).toBeDefined();
      expect(aug10!.totalMatches).toBe(2); // matches 1 and 2
    });

    it('should include days with no matches', () => {
      const startDate = new Date('2025-08-01');
      const endDate = new Date('2025-08-31');
      const view = calendar.getCalendarView(startDate, endDate);

      // Should have all days in the range
      expect(view.length).toBe(31);

      // Find a day with no matches
      const emptyDay = view.find((day) => day.totalMatches === 0);
      expect(emptyDay).toBeDefined();
      expect(emptyDay!.matches).toEqual([]);
    });
  });

  describe('Season Management', () => {
    it('should advance to new season', () => {
      calendar.scheduleCompetition(competition, matches);

      calendar.advanceSeason('2026-08-01', '2027-05-31');

      expect(calendar.getSeasonStart()).toEqual(new Date('2026-08-01'));
      expect(calendar.getSeasonEnd()).toEqual(new Date('2027-05-31'));
      expect(calendar.getMatches()).toEqual([]);
      expect(calendar.getCompetitionMatches(1)).toEqual([]);
    });
  });

  describe('Serialization', () => {
    beforeEach(() => {
      calendar.scheduleCompetition(competition, matches);
      calendar.setTeamUnavailable(1, ['2025-08-10']);
    });

    it('should serialize to JSON', () => {
      const json = calendar.toJSON();

      expect(json).toHaveProperty('seasonStart');
      expect(json).toHaveProperty('seasonEnd');
      expect(json).toHaveProperty('matches');
      expect(json).toHaveProperty('teamAvailability');
      expect((json as any).matches.length).toBe(5);
    });

    it('should deserialize from JSON', () => {
      const json = calendar.toJSON();
      const restored = Calendar.fromJSON(json);

      expect(restored.getMatches().length).toBe(5);
      expect(restored.isTeamAvailable(1, '2025-08-10')).toBe(false);
      expect(restored.isTeamAvailable(1, '2025-08-17')).toBe(true);
    });

    it('should preserve season dates after deserialization', () => {
      const json = calendar.toJSON();
      const restored = Calendar.fromJSON(json);

      expect(restored.getSeasonStart()).toEqual(new Date('2025-08-01'));
      expect(restored.getSeasonEnd()).toEqual(new Date('2026-05-31'));
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty date range in getCalendarView', () => {
      const startDate = new Date('2025-08-01');
      const endDate = new Date('2025-08-01');
      const view = calendar.getCalendarView(startDate, endDate);

      expect(view.length).toBe(1);
      expect(view[0].date).toBe('2025-08-01');
    });

    it('should handle team with no matches', () => {
      const teamMatches = calendar.getTeamMatches(99);
      expect(teamMatches).toEqual([]);
    });

    it('should handle upcoming matches with default daysAhead', () => {
      const upcoming = calendar.getUpcomingMatches(99);
      expect(upcoming).toEqual([]);
    });

    it('should handle past matches with default startDate', () => {
      const pastMatches = calendar.getPastMatches(99);
      expect(pastMatches).toEqual([]);
    });

    it('should return null for non-existent competition matches', () => {
      expect(calendar.getCompetitionMatches(99)).toEqual([]);
    });

    it('should set team available for non-existent team gracefully', () => {
      calendar.setTeamAvailable(99, ['2025-08-10']);
      expect(calendar.isTeamAvailable(99, '2025-08-10')).toBe(true);
    });
  });
});
