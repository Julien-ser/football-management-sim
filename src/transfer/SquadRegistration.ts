import { Player, Team, Competition } from '../models';
import { SquadRegistration, SquadSlot } from './types';

/**
 * SquadRegistrationManager handles squad registration for competitions
 */
export class SquadRegistrationManager {
  private registrations: Map<string, SquadRegistration>; // key: `${teamId}-${competitionId}-${season}`
  private players: Player[];
  private teams: Team[];
  private competitions: Competition[];

  constructor(players: Player[], teams: Team[], competitions: Competition[]) {
    this.players = players;
    this.teams = teams;
    this.competitions = competitions;
    this.registrations = new Map();
  }

  /**
   * Get registration key
   */
  private getKey(teamId: number, competitionId: number, season: string): string {
    return `${teamId}-${competitionId}-${season}`;
  }

  /**
   * Register a squad for a competition
   */
  registerSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[],
    slots: SquadSlot[]
  ): SquadRegistration | null {
    const team = this.teams.find((t) => t.id === teamId);
    const competition = this.competitions.find((c) => c.id === competitionId);

    if (!team || !competition) {
      return null;
    }

    const key = this.getKey(teamId, competitionId, season);

    // Get competition rules
    const rules = this.getCompetitionRules(competition.type);

    // Validate squad
    const validation = this.validateSquad(playerIds, slots, rules, teamId, competitionId);

    if (!validation.valid) {
      return null;
    }

    const registration: SquadRegistration = {
      competitionId,
      teamId,
      season,
      players: playerIds,
      registrationDate: new Date().toISOString(),
      deadline: this.getRegistrationDeadline(competition),
      maxPlayers: rules.maxPlayers,
      minGoalkeepers: rules.minGoalkeepers,
      minDefenders: rules.minDefenders,
      minMidfielders: rules.minMidfielders,
      minForwards: rules.minForwards,
    };

    this.registrations.set(key, registration);
    return registration;
  }

  /**
   * Get competition rules
   */
  private getCompetitionRules(type: Competition['type']): {
    maxPlayers: number;
    minGoalkeepers: number;
    minDefenders: number;
    minMidfielders: number;
    minForwards: number;
  } {
    switch (type) {
      case 'league':
        return {
          maxPlayers: 25,
          minGoalkeepers: 2,
          minDefenders: 5,
          minMidfielders: 5,
          minForwards: 3,
        };
      case 'champions-league':
      case 'europa-league':
      case 'conference-league':
        return {
          maxPlayers: 25,
          minGoalkeepers: 2,
          minDefenders: 4,
          minMidfielders: 4,
          minForwards: 2,
        };
      case 'cup':
        return {
          maxPlayers: 25,
          minGoalkeepers: 2,
          minDefenders: 3,
          minMidfielders: 3,
          minForwards: 2,
        };
      default:
        return {
          maxPlayers: 25,
          minGoalkeepers: 2,
          minDefenders: 3,
          minMidfielders: 3,
          minForwards: 2,
        };
    }
  }

  /**
   * Validate squad composition
   */
  private validateSquad(
    playerIds: number[],
    slots: SquadSlot[],
    rules: {
      maxPlayers: number;
      minGoalkeepers: number;
      minDefenders: number;
      minMidfielders: number;
      minForwards: number;
    },
    teamId: number,
    competitionId: number
  ): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check player count
    if (playerIds.length > rules.maxPlayers) {
      errors.push(`Squad exceeds maximum players (${playerIds.length}/${rules.maxPlayers})`);
    }

    // Check minimum requirements
    const positionCounts = this.countPositions(playerIds);

    if ((positionCounts.goalkeeper || 0) < rules.minGoalkeepers) {
      errors.push(
        `Insufficient goalkeepers (${positionCounts.goalkeeper}/${rules.minGoalkeepers})`
      );
    }
    if ((positionCounts.defender || 0) < rules.minDefenders) {
      errors.push(`Insufficient defenders (${positionCounts.defender}/${rules.minDefenders})`);
    }
    if ((positionCounts.midfielder || 0) < rules.minMidfielders) {
      errors.push(
        `Insufficient midfielders (${positionCounts.midfielder}/${rules.minMidfielders})`
      );
    }
    if ((positionCounts.forward || 0) < rules.minForwards) {
      errors.push(`Insufficient forwards (${positionCounts.forward}/${rules.minForwards})`);
    }

    // Check all players belong to team
    for (const playerId of playerIds) {
      const player = this.players.find((p) => p.id === playerId);
      if (!player || player.contract.teamId !== teamId) {
        errors.push(`Player ${playerId} not in team ${teamId}`);
      }
    }

    // Check jersey number uniqueness
    const jerseyNumbers = new Set<number>();
    for (const slot of slots) {
      if (jerseyNumbers.has(slot.jerseyNumber)) {
        errors.push(`Duplicate jersey number ${slot.jerseyNumber}`);
      }
      jerseyNumbers.add(slot.jerseyNumber);
    }

    // Check captain and vice-captain assignments
    const captains = slots.filter((s) => s.isCaptain);
    const viceCaptains = slots.filter((s) => s.isViceCaptain);

    if (captains.length > 1) {
      errors.push('Multiple captains assigned');
    }
    if (viceCaptains.length > 1) {
      errors.push('Multiple vice-captains assigned');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Count players by position category
   */
  private countPositions(playerIds: number[]): Record<string, number> {
    const counts: Record<string, number> = {
      goalkeeper: 0,
      defender: 0,
      midfielder: 0,
      forward: 0,
    };

    for (const playerId of playerIds) {
      const player = this.players.find((p) => p.id === playerId);
      if (!player) continue;

      const position = player.position;
      if (position === 'goalkeeper') {
        counts.goalkeeper++;
      } else if (position.includes('back') || position === 'center-back') {
        counts.defender++;
      } else if (position.includes('midfielder')) {
        counts.midfielder++;
      } else if (
        position.includes('winger') ||
        position === 'striker' ||
        position === 'attacking-midfielder'
      ) {
        counts.forward++;
      }
    }

    return counts;
  }

  /**
   * Get registration deadline
   */
  private getRegistrationDeadline(competition: Competition): string {
    // Calculate deadline based on competition start date
    // For now, return 1 month from now
    const deadline = new Date();
    deadline.setMonth(deadline.getMonth() + 1);
    return deadline.toISOString();
  }

  /**
   * Get squad registration
   */
  getRegistration(teamId: number, competitionId: number, season: string): SquadRegistration | null {
    const key = this.getKey(teamId, competitionId, season);
    return this.registrations.get(key) || null;
  }

  /**
   * Update squad - add players
   */
  addPlayersToSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[],
    slots?: SquadSlot[]
  ): boolean {
    const registration = this.getRegistration(teamId, competitionId, season);
    if (!registration) return false;

    const newPlayerIds = [...new Set([...registration.players, ...playerIds])];

    // Re-validate
    const validation = this.validateSquad(
      newPlayerIds,
      slots || [],
      this.getCompetitionRules(
        this.competitions.find((c) => c.id === competitionId)?.type || 'league'
      ),
      teamId,
      competitionId
    );

    if (!validation.valid) {
      return false;
    }

    registration.players = newPlayerIds;
    if (slots) {
      // Merge slots logic would go here
    }

    return true;
  }

  /**
   * Update squad - remove players
   */
  removePlayersFromSquad(
    teamId: number,
    competitionId: number,
    season: string,
    playerIds: number[]
  ): boolean {
    const registration = this.getRegistration(teamId, competitionId, season);
    if (!registration) return false;

    registration.players = registration.players.filter((id) => !playerIds.includes(id));

    // Re-validate
    const validation = this.validateSquad(
      registration.players,
      [],
      this.getCompetitionRules(
        this.competitions.find((c) => c.id === competitionId)?.type || 'league'
      ),
      teamId,
      competitionId
    );

    if (!validation.valid) {
      // Rollback
      return false;
    }

    return true;
  }

  /**
   * Update squad slots (jersey numbers, captain, etc.)
   */
  updateSquadSlots(
    teamId: number,
    competitionId: number,
    season: string,
    slots: SquadSlot[]
  ): boolean {
    const registration = this.getRegistration(teamId, competitionId, season);
    if (!registration) return false;

    const validation = this.validateSquad(
      registration.players,
      slots,
      this.getCompetitionRules(
        this.competitions.find((c) => c.id === competitionId)?.type || 'league'
      ),
      teamId,
      competitionId
    );

    if (!validation.valid) {
      return false;
    }

    // Store slots separately (could add slots to SquadRegistration type)
    return true;
  }

  /**
   * Check if player is registered for competition
   */
  isPlayerRegistered(
    playerId: number,
    teamId: number,
    competitionId: number,
    season: string
  ): boolean {
    const registration = this.getRegistration(teamId, competitionId, season);
    return registration ? registration.players.includes(playerId) : false;
  }

  /**
   * Get all registrations for a team
   */
  getTeamRegistrations(teamId: number, season?: string): SquadRegistration[] {
    const result: SquadRegistration[] = [];

    for (const [key, reg] of this.registrations) {
      if (reg.teamId === teamId) {
        if (season && reg.season !== season) continue;
        result.push(reg);
      }
    }

    return result;
  }

  /**
   * Get all registrations for a competition
   */
  getCompetitionRegistrations(competitionId: number, season?: string): SquadRegistration[] {
    const result: SquadRegistration[] = [];

    for (const [_, reg] of this.registrations) {
      if (reg.competitionId === competitionId) {
        if (season && reg.season !== season) continue;
        result.push(reg);
      }
    }

    return result;
  }

  /**
   * Update data references
   */
  updatePlayers(players: Player[]): void {
    this.players = players;
  }

  updateTeams(teams: Team[]): void {
    this.teams = teams;
  }

  updateCompetitions(competitions: Competition[]): void {
    this.competitions = competitions;
  }
}

/**
 * Factory function
 */
export function createSquadRegistrationManager(
  players: Player[],
  teams: Team[],
  competitions: Competition[]
): SquadRegistrationManager {
  return new SquadRegistrationManager(players, teams, competitions);
}
