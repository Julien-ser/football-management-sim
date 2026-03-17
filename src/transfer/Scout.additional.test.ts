import { Scout } from './Scout';
import { Player, Team } from '../models';

// Helper to create test player
function createTestPlayer(
  id: number,
  position: string = 'striker',
  rating: number = 75,
  dateOfBirth?: string,
  nationality?: string
): Player {
  const birth = dateOfBirth || new Date(1990, 0, 1).toISOString().split('T')[0];
  return {
    id,
    name: `Player ${id}`,
    nationality: nationality || 'England',
    dateOfBirth: birth,
    position: position as any,
    currentRating: rating,
    potential: rating + 10,
    contract: { teamId: 1, salary: 50000, expiryDate: '2026-06-30' },
    stats: { goals: 10, assists: 5, appearances: 30, minutesPlayed: 2700 },
  };
}

// Helper to create test team
function createTestTeam(id: number): Team {
  return {
    id,
    name: `Team ${id}`,
    shortName: `T${id}`,
    stadium: `Stadium ${id}`,
    capacity: 50000,
    leagueId: 1,
    manager: `Manager ${id}`,
    budget: 100000000,
    players: [],
  };
}

describe('Scout - Additional Coverage', () => {
  let scout: Scout;
  let team: Team;

  beforeEach(() => {
    scout = new Scout('s1', 'Test Scout', 'Europe', 0.8);
    team = createTestTeam(1);
  });

  describe('evaluatePlayer - region expertise effects', () => {
    it('should apply region expertise bonus for matching nationality', () => {
      const player = createTestPlayer(1, 'striker', 80, '1995-01-01', 'England'); // scout region is Europe, but England is not exactly Europe? Actually regionExpertise is 'Europe', nationality is 'England' - that is in Europe. So should get bonus? In code, if nationality !== regionExpertise, penalty -5. So England !== Europe? 'Europe' is a region, not a nationality. So mismatch. Better test: use 'France' as nationality and region 'France'? But regionExpertise expects region like 'England'? Actually regionExpertise is a string representing region/nationality. In e2e test we used 'England'. For now, the condition is strict inequality. So if player.nationality === this.regionExpertise, no penalty; else -5. So to test both branches, we need player nationality equal and not equal. So:
      // Not equal case: player nationality != regionExpertise => penalty
      const playerMismatch = createTestPlayer(1, 'striker', 80, '1995-01-01', 'Brazil');
      const ratingMismatch = scout['evaluatePlayer'](playerMismatch);
      expect(ratingMismatch).toBeLessThan(80); // because variance and -5

      // Equal case: player nationality == regionExpertise => no penalty
      const playerMatch = createTestPlayer(2, 'striker', 80, '1995-01-01', 'England'); // match scout region
      const scoutMatch = new Scout('s2', 'Match Scout', 'England', 1.0); // perfect knowledge
      const ratingMatch = scoutMatch['evaluatePlayer'](playerMatch);
      expect(ratingMatch).toBe(80); // because no variance when knowledge=1, no penalty
    });
  });

  describe('evaluatePotential - age ranges', () => {
    it('should evaluate potential for young players (<20)', () => {
      const youngPlayer = createTestPlayer(1, 'striker', 70, '2010-01-01'); // age ~15
      const potential = scout['evaluatePotential'](youngPlayer);
      // formula: if age<20: potential = currentRating + (30 - age)*2. Age ~15 => (30-15)*2=30 => 70+30=100, plus variance.
      expect(potential).toBeGreaterThanOrEqual(90); // at least high
    });

    it('should evaluate potential for mid-age players (20-25)', () => {
      const midPlayer = createTestPlayer(1, 'striker', 70, '2000-01-01'); // age ~25
      const potential = scout['evaluatePotential'](midPlayer);
      // if age < 25: potential = currentRating + (28 - age)*1.5. For age=25, (28-25)*1.5=4.5 => 74.5 + variance => around 74-84
      expect(potential).toBeGreaterThanOrEqual(70);
      expect(potential).toBeLessThanOrEqual(90);
    });

    it('should evaluate potential for players 25-30', () => {
      const olderPlayer = createTestPlayer(1, 'striker', 70, '1995-01-01'); // age 30
      const potential = scout['evaluatePotential'](olderPlayer);
      // if age < 30: potential = currentRating + (30 - age). For age=30, (30-30)=0 => 70 + variance => around 65-75
      expect(potential).toBeGreaterThanOrEqual(65);
      expect(potential).toBeLessThanOrEqual(80);
    });

    it('should evaluate potential for older players (30+)', () => {
      const oldPlayer = createTestPlayer(1, 'striker', 70, '1985-01-01'); // age 40
      const potential = scout['evaluatePotential'](oldPlayer);
      // else: potential = currentRating - 1 + variance => around 59-79
      expect(potential).toBeLessThanOrEqual(80);
    });
  });

  describe('calculateConfidence - factors', () => {
    it('should increase confidence for players from scouting region', () => {
      const player = createTestPlayer(1, 'striker', 80, '1995-01-01', 'France');
      const scoutRegion = new Scout('s2', 'Regional', 'France', 0.8);
      const confidence = scoutRegion['calculateConfidence'](player, team);
      // base 0.8 + 0.1 region match = 0.9 (capped at 1)
      expect(confidence).toBeGreaterThan(0.85);
    });

    it('should decrease confidence for young players', () => {
      const youngPlayer = createTestPlayer(1, 'striker', 80, '2010-01-01');
      const confidence = scout['calculateConfidence'](youngPlayer, team);
      // base 0.8 - 0.1 for age <20 = 0.7 (plus other factors)
      expect(confidence).toBeLessThan(0.8);
    });

    it('should decrease confidence for older players', () => {
      const oldPlayer = createTestPlayer(1, 'striker', 80, '1985-01-01');
      oldPlayer.stats.appearances = 0; // remove other factors to isolate age effect
      const confidence = scout['calculateConfidence'](oldPlayer, team);
      // base 0.8 - 0.05 for age >30 = 0.75 (no other factors)
      expect(confidence).toBeLessThan(0.8);
    });

    it('should increase confidence with more appearances', () => {
      const player = createTestPlayer(1, 'striker', 80, '2000-01-01'); // younger age to avoid age penalty
      player.stats.appearances = 200; // high appearances
      const confidence = scout['calculateConfidence'](player, team);
      // appearancesFactor = min(0.2, 200*0.002)=0.2 (capped)
      // base 0.8 + 0.2 = 1.0 (capped), no region bonus (mismatch), no age penalty
      expect(confidence).toBeCloseTo(1.0, 1);
    });
  });

  describe('generateRecommendations - all branches', () => {
    it('should recommend "sign" and "immediate starter" for high rating/potential', () => {
      const player = createTestPlayer(1, 'striker', 85, '1995-01-01');
      player.potential = 90;
      const recs = scout['generateRecommendations'](player.currentRating, player.potential, player);
      expect(recs).toContain('sign');
      expect(recs).toContain('immediate starter');
    });

    it('should recommend "sign" and "rotation player" for good rating/potential', () => {
      const player = createTestPlayer(1, 'striker', 78, '1995-01-01');
      player.potential = 82;
      const recs = scout['generateRecommendations'](player.currentRating, player.potential, player);
      expect(recs).toContain('sign');
      expect(recs).toContain('rotation player');
    });

    it('should recommend "monitor" and "potential development" for decent potential', () => {
      const player = createTestPlayer(1, 'striker', 72, '1995-01-01');
      player.potential = 77;
      const recs = scout['generateRecommendations'](player.currentRating, player.potential, player);
      expect(recs).toContain('monitor');
      expect(recs).toContain('potential development');
    });

    it('should recommend "prospect" and "loan for development" for young high potential', () => {
      const youngPlayer = createTestPlayer(1, 'striker', 60, '2005-01-01'); // age 19
      youngPlayer.potential = 85;
      const recs = scout['generateRecommendations'](
        youngPlayer.currentRating,
        youngPlayer.potential,
        youngPlayer
      );
      expect(recs).toContain('prospect');
      expect(recs).toContain('loan for development');
    });

    it('should recommend "avoid" for low rating/potential', () => {
      const player = createTestPlayer(1, 'striker', 50, '1995-01-01');
      player.potential = 55;
      const recs = scout['generateRecommendations'](player.currentRating, player.potential, player);
      expect(recs).toContain('avoid');
    });
  });

  describe('analyzeStrengthsWeaknesses - position-specific', () => {
    it('should identify striker with high goals as clinical finisher', () => {
      const striker = createTestPlayer(1, 'striker', 80, '1995-01-01');
      striker.stats.goals = 20;
      const { strengths, weaknesses } = scout['analyzeStrengthsWeaknesses'](striker);
      expect(strengths).toContain('Clinical finishing');
    });

    it('should identify striker with low goals as poor conversion', () => {
      const striker = createTestPlayer(1, 'striker', 80, '1995-01-01');
      striker.stats.goals = 3;
      const { strengths, weaknesses } = scout['analyzeStrengthsWeaknesses'](striker);
      expect(weaknesses).toContain('Poor goal conversion');
    });

    it('should identify midfielder with high assists as creative playmaker', () => {
      const mid = createTestPlayer(1, 'attacking-midfielder', 80, '1995-01-01');
      mid.stats.assists = 12;
      const { strengths, weaknesses } = scout['analyzeStrengthsWeaknesses'](mid);
      expect(strengths).toContain('Creative playmaker');
    });

    it('should identify midfielder with low assists as limited creative output', () => {
      const mid = createTestPlayer(1, 'attacking-midfielder', 80, '1995-01-01');
      mid.stats.assists = 1;
      const { strengths, weaknesses } = scout['analyzeStrengthsWeaknesses'](mid);
      expect(weaknesses).toContain('Limited creative output');
    });

    it('should identify elite rating as elite technical ability', () => {
      const player = createTestPlayer(1, 'striker', 85, '1995-01-01');
      const { strengths } = scout['analyzeStrengthsWeaknesses'](player);
      expect(strengths).toContain('Elite technical ability');
    });

    it('should identify low rating as technical deficiencies', () => {
      const player = createTestPlayer(1, 'striker', 55, '1995-01-01');
      const { weaknesses } = scout['analyzeStrengthsWeaknesses'](player);
      expect(weaknesses).toContain('Technical deficiencies');
    });

    it('should identify experienced player (>100 appearances)', () => {
      const player = createTestPlayer(1, 'striker', 75, '1995-01-01');
      player.stats.appearances = 150;
      const { strengths } = scout['analyzeStrengthsWeaknesses'](player);
      expect(strengths).toContain('Experienced');
    });

    it('should identify inexperienced player (<20 appearances)', () => {
      const player = createTestPlayer(1, 'striker', 75, '1995-01-01');
      player.stats.appearances = 10;
      const { weaknesses } = scout['analyzeStrengthsWeaknesses'](player);
      expect(weaknesses).toContain('Inexperienced');
    });
  });

  describe('calculateAge - edge cases', () => {
    it('should calculate age correctly for recent birthday', () => {
      const today = new Date();
      const lastYear = today.getFullYear() - 1;
      const birthDate = `${lastYear}-${today.getMonth() + 1}-${today.getDate()}`;
      const player = createTestPlayer(1, 'striker', 75, birthDate);
      const age = scout['calculateAge'](player.dateOfBirth);
      expect(age).toBe(1); // approximately
    });
  });
});
