import { EventManager, MatchEvent as EventManagerMatchEvent } from './events';
import { TeamAI } from './TeamAI';
import { SimulationConfig, DEFAULT_SIMULATION_CONFIG } from './config';
import { Match } from '../models/Match';
import { MatchStatus } from '../models/Match';
import { Team, Tactics } from '../models/Team';
import { Player } from '../models/Player';

export interface SimulateMatchOptions {
  homeTeam: Team;
  awayTeam: Team;
  homePlayers: Player[];
  awayPlayers: Player[];
  homeTactics?: Tactics;
  awayTactics?: Tactics;
  config?: SimulationConfig;
}

export class MatchSimulator {
  private eventManager: EventManager;
  private config: SimulationConfig;
  private homeTeamAI: TeamAI;
  private awayTeamAI: TeamAI;
  private homePlayers: Player[];
  private awayPlayers: Player[];
  private homeTeam: Team;
  private awayTeam: Team;

  // Match state
  private currentMinute: number = 0;
  private homeScore: number = 0;
  private awayScore: number = 0;
  private half: number = 1;
  private isHalfTime: boolean = false;
  private isFullTime: boolean = false;

  // Statistics
  private stats = {
    possession: { home: 50, away: 50 },
    shots: { home: 0, away: 0 },
    shotsOnTarget: { home: 0, away: 0 },
    passes: { home: 0, away: 0 },
    passAccuracy: { home: 0, away: 0 },
    fouls: { home: 0, away: 0 },
    corners: { home: 0, away: 0 },
    offsides: { home: 0, away: 0 },
    yellowCards: { home: 0, away: 0 },
    redCards: { home: 0, away: 0 },
  };

  // Fatigue tracking (playerId -> fatigue level 0-100)
  private playerFatigue: Map<number, number> = new Map();
  // Player availability (substituted/injured)
  private unavailablePlayers: Set<number> = new Set();
  // Yellow card tracking (playerId -> count)
  private playerYellowCards: Map<number, number> = new Map();

  // Match result
  private events: EventManagerMatchEvent[] = [];
  private startTime: number = 0;

  constructor(options: SimulateMatchOptions, eventManager?: EventManager) {
    this.homeTeam = options.homeTeam;
    this.awayTeam = options.awayTeam;
    this.homePlayers = options.homePlayers;
    this.awayPlayers = options.awayPlayers;
    this.config = options.config || DEFAULT_SIMULATION_CONFIG;
    this.eventManager = eventManager || new EventManager();

    this.homeTeamAI = new TeamAI(
      options.homeTeam,
      options.homePlayers,
      options.homeTactics || options.homeTeam.tactics
    );
    this.awayTeamAI = new TeamAI(
      options.awayTeam,
      options.awayPlayers,
      options.awayTactics || options.awayTeam.tactics
    );
  }

  getEventManager(): EventManager {
    return this.eventManager;
  }

  async simulate(): Promise<Match> {
    this.startTime = Date.now();
    this.events = [];
    this.currentMinute = 0;
    this.homeScore = 0;
    this.awayScore = 0;
    this.half = 1;
    this.isHalfTime = false;
    this.isFullTime = false;
    this.stats = {
      possession: { home: 50, away: 50 },
      shots: { home: 0, away: 0 },
      shotsOnTarget: { home: 0, away: 0 },
      passes: { home: 0, away: 0 },
      passAccuracy: { home: 0, away: 0 },
      fouls: { home: 0, away: 0 },
      corners: { home: 0, away: 0 },
      offsides: { home: 0, away: 0 },
      yellowCards: { home: 0, away: 0 },
      redCards: { home: 0, away: 0 },
    };
    this.playerFatigue.clear();
    this.unavailablePlayers.clear();
    this.playerYellowCards.clear();

    // Initialize player fatigue
    this.homePlayers.forEach((p) => {
      this.playerFatigue.set(p.id, 0);
      this.playerYellowCards.set(p.id, 0);
    });
    this.awayPlayers.forEach((p) => {
      this.playerFatigue.set(p.id, 0);
      this.playerYellowCards.set(p.id, 0);
    });

    // Emit match start
    const startEvent: EventManagerMatchEvent = {
      minute: 0,
      type: 'match-start',
      teamId: this.homeTeam.id,
      details: `Match starting: ${this.homeTeam.name} vs ${this.awayTeam.name}`,
    };
    this.events.push(startEvent);
    this.emitEvent(startEvent);

    // Simulate each minute
    const totalMinutes = this.config.matchDuration + this.getExtraTime();

    for (this.currentMinute = 1; this.currentMinute <= totalMinutes; this.currentMinute++) {
      if (this.isFullTime) break;

      this.simulateMinute(this.currentMinute);

      // Add half-time break logic
      if (this.currentMinute === 45 && this.half === 1) {
        const halfTimeEvent: EventManagerMatchEvent = {
          minute: 45,
          type: 'half-time',
          teamId: this.homeTeam.id,
          details: 'Half time',
        };
        this.events.push(halfTimeEvent);
        this.emitEvent(halfTimeEvent);
        this.isHalfTime = true;
        this.half = 2;
        // Brief "break" - reset some fatigue
        this.playerFatigue.forEach((fatigue, playerId) => {
          this.playerFatigue.set(playerId, Math.max(0, fatigue - 20));
        });
      }
    }

    // Ensure full-time event
    if (!this.isFullTime) {
      const fullTimeEvent: EventManagerMatchEvent = {
        minute: totalMinutes,
        type: 'full-time',
        teamId: this.homeTeam.id,
        details: `Final score: ${this.homeScore} - ${this.awayScore}`,
      };
      this.events.push(fullTimeEvent);
      this.emitEvent(fullTimeEvent);
    }

    this.eventManager.complete();

    return this.buildMatchResult();
  }

  private simulateMinute(minute: number): void {
    // Check for substitutions
    this.processSubstitutions(minute);

    // Update fatigue for all players on field
    this.updateFatigue(minute);

    // Determine possession (weighted by tactics)
    const possessionTeam = this.determinePossession(minute);
    const isHomePossession = possessionTeam === 'home';

    // Update possession stats
    if (isHomePossession) {
      this.stats.possession.home += 0.5;
      this.stats.passes.home++;
      if (Math.random() > 0.3) {
        // Pass accuracy ~70%
        this.stats.passAccuracy.home++;
      }
    } else {
      this.stats.possession.away += 0.5;
      this.stats.passes.away++;
      if (Math.random() > 0.3) {
        this.stats.passAccuracy.away++;
      }
    }

    // Normalize possession to 100%
    const total = this.stats.possession.home + this.stats.possession.away;
    if (total > 0) {
      this.stats.possession.home = (this.stats.possession.home / total) * 100;
      this.stats.possession.away = (this.stats.possession.away / total) * 100;
    }

    // Generate main match event (goal, card, injury, etc.)
    const event = this.generateEvent(minute, isHomePossession);
    if (event) {
      this.processEvent(event);
    }

    // Occasional special events (corners, fouls)
    if (Math.random() < 0.05) {
      this.generateSetPiece(minute, isHomePossession);
    }
  }

  private processSubstitutions(minute: number): void {
    // Check home team
    const homeSub = this.homeTeamAI.shouldSubstitute(
      {
        minute,
        homeScore: this.homeScore,
        awayScore: this.awayScore,
        isHomeTeam: true,
        formation: this.homeTeamAI.getTactics().formation,
        mentality: this.homeTeamAI.getTactics().mentality,
        pressingIntensity: this.homeTeamAI.getTactics().pressingIntensity,
        passingStyle: this.homeTeamAI.getTactics().passingStyle,
      },
      this.playerFatigue
    );

    if (homeSub) {
      const player = this.homePlayers.find((p) => p.id === homeSub.playerId);
      if (player && !this.unavailablePlayers.has(player.id)) {
        this.unavailablePlayers.add(player.id);
        this.homeTeamAI.recordSubstitution();
        this.emitEvent({
          minute,
          type: 'substitution',
          teamId: this.homeTeam.id,
          playerId: player.id,
          details: `Substitution: ${player.name} off`,
        });
      }
    }

    // Check away team
    const awaySub = this.awayTeamAI.shouldSubstitute(
      {
        minute,
        homeScore: this.homeScore,
        awayScore: this.awayScore,
        isHomeTeam: false,
        formation: this.awayTeamAI.getTactics().formation,
        mentality: this.awayTeamAI.getTactics().mentality,
        pressingIntensity: this.awayTeamAI.getTactics().pressingIntensity,
        passingStyle: this.awayTeamAI.getTactics().passingStyle,
      },
      this.playerFatigue
    );

    if (awaySub) {
      const player = this.awayPlayers.find((p) => p.id === awaySub.playerId);
      if (player && !this.unavailablePlayers.has(player.id)) {
        this.unavailablePlayers.add(player.id);
        this.awayTeamAI.recordSubstitution();
        this.emitEvent({
          minute,
          type: 'substitution',
          teamId: this.awayTeam.id,
          playerId: player.id,
          details: `Substitution: ${player.name} off`,
        });
      }
    }
  }

  private updateFatigue(minute: number): void {
    // Increase fatigue for players on field
    const fatigueRate = 0.15; // per minute
    this.homeTeamAI.getStartingXI().forEach((assignment) => {
      if (!this.unavailablePlayers.has(assignment.playerId)) {
        const current = this.playerFatigue.get(assignment.playerId) || 0;
        this.playerFatigue.set(assignment.playerId, Math.min(100, current + fatigueRate));
      }
    });
    this.awayTeamAI.getStartingXI().forEach((assignment) => {
      if (!this.unavailablePlayers.has(assignment.playerId)) {
        const current = this.playerFatigue.get(assignment.playerId) || 0;
        this.playerFatigue.set(assignment.playerId, Math.min(100, current + fatigueRate));
      }
    });
  }

  private determinePossession(minute: number): 'home' | 'away' {
    // Base possession from tactics and team quality
    const homeTactics = this.homeTeamAI.getTactics();
    const awayTactics = this.awayTeamAI.getTactics();

    // Home advantage
    let homeWeight = 50; // base 50%

    // Attacking mentality increases possession
    if (homeTactics.mentality === 'attacking') homeWeight += 10;
    if (homeTactics.mentality === 'defensive') homeWeight -= 10;

    // Passing style affects possession
    if (homeTactics.passingStyle === 'short') homeWeight += 5;
    if (homeTactics.passingStyle === 'long') homeWeight -= 5;

    // Width affects possession control
    if (homeTactics.width === 'wide') homeWeight += 3;
    if (homeTactics.width === 'narrow') homeWeight -= 3;

    // Defensive line affects control
    if (homeTactics.defensiveLine === 'high') homeWeight += 4;
    if (homeTactics.defensiveLine === 'low') homeWeight -= 4;

    // Team quality difference (simplified)
    const homeAvgRating = this.getAverageRating(this.homePlayers);
    const awayAvgRating = this.getAverageRating(this.awayPlayers);
    const ratingDiff = homeAvgRating - awayAvgRating;
    homeWeight += ratingDiff * 0.2; // up to ±20%

    // Add randomness
    homeWeight += (Math.random() - 0.5) * 20;

    return homeWeight > 50 ? 'home' : 'away';
  }

  private generateEvent(minute: number, isHomePossession: boolean): EventManagerMatchEvent | null {
    const attackingTeam = isHomePossession ? 'home' : 'away';
    const attackingTeamId = isHomePossession ? this.homeTeam.id : this.awayTeam.id;

    // Adjust probabilities based on minute (higher intensity late in half)
    const intensityMultiplier = minute > this.config.highIntensityStart ? 1.3 : 1.0;

    // Calculate weighted random event
    const weights = [
      { type: 'goal', weight: this.config.weightGoal * intensityMultiplier },
      { type: 'own-goal', weight: this.config.weightOwnGoal * intensityMultiplier },
      { type: 'yellow-card', weight: this.config.weightYellowCard },
      { type: 'red-card', weight: this.config.weightRedCard },
      { type: 'injury', weight: this.config.weightInjury },
    ];

    // Only add penalty if rare event triggers
    if (Math.random() < 0.001) {
      weights.push({ type: 'penalty', weight: this.config.weightPenalty });
    }

    const totalWeight = weights.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weights) {
      random -= w.weight;
      if (random <= 0) {
        return this.createEventForType(w.type, minute, attackingTeamId, attackingTeam);
      }
    }

    return null; // No event this minute
  }

  private createEventForType(
    type: string,
    minute: number,
    attackingTeamId: number,
    attackingTeam: 'home' | 'away'
  ): EventManagerMatchEvent {
    const baseDetails: Omit<EventManagerMatchEvent, 'minute' | 'type' | 'details'> = {
      teamId: attackingTeamId,
    };

    switch (type) {
      case 'goal': {
        const scorer = this.selectScorer(attackingTeam);
        const assist = this.selectAssister(attackingTeam, scorer?.id);
        const details = scorer
          ? `Goal! ${scorer.name}${assist ? ` assisted by ${assist.name}` : ''} scores!`
          : 'Goal!';

        // Always increment score and stats for a goal event
        this.stats.shots[attackingTeam]++;
        this.stats.shotsOnTarget[attackingTeam]++;
        if (attackingTeam === 'home') {
          this.homeScore++;
        } else {
          this.awayScore++;
        }

        return {
          minute,
          type: 'goal',
          playerId: scorer?.id,
          teamId: attackingTeamId,
          details,
        };
      }

      case 'yellow-card': {
        const player = this.selectRandomPlayer(
          attackingTeam === 'home' ? 'away' : 'home',
          'yellow-card'
        );
        const teamId = player
          ? this.homePlayers.includes(player)
            ? this.homeTeam.id
            : this.awayTeam.id
          : attackingTeam === 'home'
            ? this.awayTeam.id
            : this.homeTeam.id;
        this.stats.yellowCards[attackingTeam === 'home' ? 'away' : 'home']++;
        return {
          minute,
          type: 'yellow-card',
          playerId: player?.id,
          teamId,
          details: `Yellow card for ${player?.name || 'a player'}`,
        };
      }

      case 'injury': {
        const player = this.selectRandomPlayer(attackingTeam, 'injury');
        if (player) {
          this.unavailablePlayers.add(player.id);
        }
        return {
          minute,
          type: 'injury',
          playerId: player?.id,
          teamId: attackingTeamId,
          details: `Injury: ${player?.name || 'A player'} is down`,
        };
      }

      case 'red-card': {
        const player = this.selectRandomPlayer(
          attackingTeam === 'home' ? 'away' : 'home',
          'red-card'
        );
        const teamId = player
          ? this.homePlayers.includes(player)
            ? this.homeTeam.id
            : this.awayTeam.id
          : attackingTeam === 'home'
            ? this.awayTeam.id
            : this.homeTeam.id;
        return {
          minute,
          type: 'red-card',
          playerId: player?.id,
          teamId,
          details: `Red card for ${player?.name || 'a player'}`,
        };
      }

      case 'own-goal': {
        // Own goal: player from defending team puts ball in their own net
        const defendingTeam = attackingTeam === 'home' ? 'away' : 'home';
        const player = this.selectRandomPlayer(defendingTeam, 'own-goal');
        // teamId should be the team that benefits (attacking team)
        // as per test expectations
        const teamId = attackingTeamId;
        // Score for the attacking team (already incremented via processEvent later)
        return {
          minute,
          type: 'own-goal',
          playerId: player?.id,
          teamId,
          details: `Own goal by ${player?.name || 'a defender'}!`,
        };
      }

      default:
        return {
          minute,
          type: 'minute-passed',
          teamId: attackingTeamId,
          details: '',
        };
    }
  }

  private generateSetPiece(minute: number, isHomePossession: boolean): void {
    const team = isHomePossession ? 'home' : 'away';
    const teamId = isHomePossession ? this.homeTeam.id : this.awayTeam.id;

    if (Math.random() < 0.7) {
      this.stats.corners[team]++;
      this.emitEvent({
        minute,
        type: 'corner',
        teamId,
        details: 'Corner kick',
      });
    } else {
      this.stats.fouls[team]++;
      this.emitEvent({
        minute,
        type: 'foul',
        teamId,
        details: 'Foul committed',
      });
    }
  }

  private processEvent(event: EventManagerMatchEvent): void {
    this.events.push(event);

    // Track yellow cards and convert to red on second yellow
    if (event.type === 'yellow-card' && event.playerId) {
      const currentYellow = this.playerYellowCards.get(event.playerId) || 0;
      this.playerYellowCards.set(event.playerId, currentYellow + 1);

      // Second yellow = red card
      if (currentYellow + 1 >= 2) {
        const redCardEvent: EventManagerMatchEvent = {
          minute: event.minute,
          type: 'red-card',
          playerId: event.playerId,
          teamId: event.teamId,
          details: `Red card! ${event.details} (second yellow)`,
        };
        this.events.push(redCardEvent);
        this.emitEvent(redCardEvent);
        this.unavailablePlayers.add(event.playerId);
        this.stats.redCards[event.teamId === this.homeTeam.id ? 'home' : 'away']++;
      }
    }

    // Mark player unavailable for red cards (direct or from second yellow)
    if (event.type === 'red-card' && event.playerId) {
      this.unavailablePlayers.add(event.playerId);
      this.stats.redCards[event.teamId === this.homeTeam.id ? 'home' : 'away']++;
    }

    // Handle injuries
    if (event.type === 'injury' && event.playerId) {
      this.unavailablePlayers.add(event.playerId);
    }

    // Handle own goals - event.teamId is the benefiting team (attacking)
    if (event.type === 'own-goal') {
      if (event.teamId === this.homeTeam.id) {
        this.homeScore++;
      } else {
        this.awayScore++;
      }
    }

    this.emitEvent(event);
  }

  private emitEvent(event: EventManagerMatchEvent): void {
    this.eventManager.emit(event);
  }

  private selectScorer(team: 'home' | 'away'): Player | null {
    const players = team === 'home' ? this.homePlayers : this.awayPlayers;
    const available = players.filter((p) => !this.unavailablePlayers.has(p.id));
    const startingXI =
      team === 'home' ? this.homeTeamAI.getStartingXI() : this.awayTeamAI.getStartingXI();

    // Weight by position (forwards more likely) and rating
    const weighted = startingXI
      .map((assignment) => {
        const player = available.find((p) => p.id === assignment.playerId);
        if (!player) return null;

        let weight = player.currentRating / 100;
        if (assignment.position.includes('ST')) weight *= 2.0;
        if (assignment.position.includes('CM')) weight *= 1.2;
        if (assignment.position.includes('CB') || assignment.position.includes('GK')) weight *= 0.3;

        return { player, weight };
      })
      .filter((w) => w !== null && w.weight > 0)
      .map((w) => ({ player: w!.player, weight: w!.weight }));

    if (weighted.length === 0) return null;

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weighted) {
      random -= w.weight;
      if (random <= 0) return w.player;
    }

    return weighted[0].player;
  }

  private selectAssister(team: 'home' | 'away', excludePlayerId?: number): Player | null {
    const players = team === 'home' ? this.homePlayers : this.awayPlayers;
    const available = players.filter(
      (p) => !this.unavailablePlayers.has(p.id) && p.id !== excludePlayerId
    );
    const startingXI =
      team === 'home' ? this.homeTeamAI.getStartingXI() : this.awayTeamAI.getStartingXI();

    const weighted = startingXI
      .map((assignment) => {
        const player = available.find((p) => p.id === assignment.playerId);
        if (!player) return null;

        let weight = player.currentRating / 100;
        if (assignment.position.includes('CM')) weight *= 1.5;
        if (assignment.position.includes('ST')) weight *= 0.8;

        return { player, weight };
      })
      .filter((w) => w !== null && w.weight > 0)
      .map((w) => ({ player: w!.player, weight: w!.weight }));

    if (weighted.length === 0) return null;

    if (Math.random() < 0.3) return null; // No assist sometimes

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weighted) {
      random -= w.weight;
      if (random <= 0) return w.player;
    }

    return weighted[0].player;
  }

  private selectRandomPlayer(team: 'home' | 'away', eventType: string): Player | null {
    const players = team === 'home' ? this.homePlayers : this.awayPlayers;
    const available = players.filter((p) => !this.unavailablePlayers.has(p.id));
    if (available.length === 0) return null;

    // Weight by position based on event type
    const weighted = available.map((player) => {
      let weight = 1.0;
      const assignment =
        team === 'home'
          ? this.homeTeamAI.getStartingXI().find((a) => a.playerId === player.id)
          : this.awayTeamAI.getStartingXI().find((a) => a.playerId === player.id);

      if (eventType === 'yellow-card') {
        // Defenders get more cards
        if (
          assignment?.position.includes('CB') ||
          assignment?.position.includes('LB') ||
          assignment?.position.includes('RB')
        ) {
          weight = 1.5;
        }
        if (assignment?.position.includes('ST')) weight = 0.7;
      }

      return { player, weight };
    });

    const totalWeight = weighted.reduce((sum, w) => sum + w.weight, 0);
    let random = Math.random() * totalWeight;

    for (const w of weighted) {
      random -= w.weight;
      if (random <= 0) return w.player;
    }

    return weighted[0].player;
  }

  private getAverageRating(players: Player[]): number {
    const available = players.filter((p) => !this.unavailablePlayers.has(p.id));
    if (available.length === 0) return 50;
    const sum = available.reduce((acc, p) => acc + p.currentRating, 0);
    return sum / available.length;
  }

  private getExtraTime(): number {
    if (this.config.extraTimeMax === 0) return 0;
    return (
      Math.floor(Math.random() * (this.config.extraTimeMax - this.config.extraTimeMin + 1)) +
      this.config.extraTimeMin
    );
  }

  private buildMatchResult(): Match {
    const duration = this.config.matchDuration + this.getExtraTime();

    return {
      id: Date.now(), // Temporary ID
      homeTeamId: this.homeTeam.id,
      awayTeamId: this.awayTeam.id,
      competitionId: 0, // To be set by caller
      date: new Date().toISOString(),
      venue: this.homeTeam.stadium,
      status: 'completed',
      score: {
        home: this.homeScore,
        away: this.awayScore,
      },
      halfTimeScore: {
        home: this.homeScore,
        away: this.awayScore,
      },
      events: this.events as any[], // Convert to model MatchEvent format
      statistics: {
        possession: {
          home: Math.round(this.stats.possession.home),
          away: Math.round(this.stats.possession.away),
        },
        shots: {
          home: this.stats.shots.home,
          away: this.stats.shots.away,
        },
        shotsOnTarget: {
          home: this.stats.shotsOnTarget.home,
          away: this.stats.shotsOnTarget.away,
        },
        passes: {
          home: this.stats.passes.home,
          away: this.stats.passes.away,
        },
        passAccuracy: {
          home:
            this.stats.passes.home > 0
              ? Math.round((this.stats.passAccuracy.home / this.stats.passes.home) * 100)
              : 0,
          away:
            this.stats.passes.away > 0
              ? Math.round((this.stats.passAccuracy.away / this.stats.passes.away) * 100)
              : 0,
        },
        fouls: {
          home: this.stats.fouls.home,
          away: this.stats.fouls.away,
        },
        corners: {
          home: this.stats.corners.home,
          away: this.stats.corners.away,
        },
        offsides: {
          home: this.stats.offsides.home,
          away: this.stats.offsides.away,
        },
      },
    };
  }
}
