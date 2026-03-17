import { Team, Tactics } from '../models/Team';
import { Player as PlayerModel } from '../models/Player';

export interface PlayerRoleAssignment {
  playerId: number;
  position: string; // Position from Team formation map
  role: string; // e.g., 'Advanced Forward', 'Ball Playing Defender'
}

export interface MatchContext {
  minute: number;
  homeScore: number;
  awayScore: number;
  isHomeTeam: boolean;
  formation: string;
  mentality: 'defensive' | 'balanced' | 'attacking';
  pressingIntensity: 'low' | 'medium' | 'high';
  passingStyle: 'short' | 'mixed' | 'long';
}

export class TeamAI {
  private team: Team;
  private players: PlayerModel[];
  private startingXI: PlayerRoleAssignment[];
  private tactics: Tactics;
  private substitutions: number = 0;
  private maxSubstitutions: number = 5;

  constructor(team: Team, players: PlayerModel[], tactics?: Tactics) {
    this.team = team;
    this.players = players;
    this.tactics = tactics ||
      team.tactics || {
        formation: '4-4-2',
        mentality: 'balanced',
        pressingIntensity: 'medium',
        passingStyle: 'mixed',
      };
    this.startingXI = this.selectStartingXI();
  }

  getTactics(): Tactics {
    return this.tactics;
  }

  getStartingXI(): PlayerRoleAssignment[] {
    return this.startingXI;
  }

  getFormationPositions(formation: string): string[] {
    // Parse formation like "4-4-2" into position array
    const parts = formation.split('-').map(Number);
    const [defenders, mids, forwards] = parts;
    const gk = 1;
    return [
      'GK',
      ...Array(defenders)
        .fill(0)
        .map((_, i) => `CB${i + 1}`),
      ...Array(mids)
        .fill(0)
        .map((_, i) => `CM${i + 1}`),
      ...Array(forwards)
        .fill(0)
        .map((_, i) => `ST${i + 1}`),
    ];
  }

  private selectStartingXI(): PlayerRoleAssignment[] {
    const positions = this.getFormationPositions(this.tactics.formation);
    const selectedPlayers = new Set<number>();
    const assignments: PlayerRoleAssignment[] = [];

    // Simple selection: pick best available players for each position
    for (const pos of positions) {
      const suitablePlayers = this.players
        .filter((p) => {
          if (selectedPlayers.has(p.id)) return false;
          return this.matchesPosition(p.position, pos);
        })
        .sort((a, b) => b.currentRating - a.currentRating);

      if (suitablePlayers.length > 0) {
        selectedPlayers.add(suitablePlayers[0].id);
        assignments.push({
          playerId: suitablePlayers[0].id,
          position: pos,
          role: this.getRoleForPosition(pos, this.tactics.mentality),
        });
      }
    }

    return assignments;
  }

  private matchesPosition(playerPos: string, formationPos: string): boolean {
    // Simplified position matching
    const positionGroups: Record<string, string[]> = {
      GK: ['goalkeeper'],
      CB: ['center-back'],
      LB: ['left-back'],
      RB: ['right-back'],
      CM: ['defensive-midfielder', 'central-midfielder', 'attacking-midfielder'],
      ST: ['striker', 'right-winger', 'left-winger', 'attacking-midfielder'],
    };

    for (const [key, positions] of Object.entries(positionGroups)) {
      if (formationPos.startsWith(key) && positions.includes(playerPos)) {
        return true;
      }
    }
    return false;
  }

  private getRoleForPosition(position: string, mentality: string): string {
    const roles: Record<string, Record<string, string>> = {
      GK: { defensive: 'Sweeper Keeper', balanced: 'Goalkeeper', attacking: 'Goalkeeper' },
      CB: {
        defensive: 'Central Defender',
        balanced: 'Ball Playing Defender',
        attacking: 'Ball Playing Defender',
      },
      CM: {
        defensive: 'Defensive Midfielder',
        balanced: 'Box-to-Box Midfielder',
        attacking: 'Advanced Playmaker',
      },
      ST: {
        defensive: 'Target Man',
        balanced: 'Advanced Forward',
        attacking: 'Complete Forward',
      },
    };

    for (const [pos, mentalityRoles] of Object.entries(roles)) {
      if (position.startsWith(pos)) {
        return mentalityRoles[mentality] || mentalityRoles.balanced;
      }
    }
    return 'Natural';
  }

  shouldSubstitute(
    context: MatchContext,
    playerFatigue: Map<number, number>
  ): { playerId: number; reason: string } | null {
    // Decide if a substitution is needed
    if (this.substitutions >= this.maxSubstitutions) return null;

    const { minute, homeScore, awayScore, isHomeTeam } = context;
    const teamScore = isHomeTeam ? homeScore : awayScore;
    const opponentScore = isHomeTeam ? awayScore : homeScore;
    const isLosing = teamScore < opponentScore;
    const isWinning = teamScore > opponentScore;
    const isClose = Math.abs(teamScore - opponentScore) <= 1;

    // Check for fatigue (players with low stamina)
    const fatiguedPlayers = this.startingXI.filter((assignment) => {
      const fatigue = playerFatigue.get(assignment.playerId) || 0;
      return fatigue > 80; // Fatigue threshold
    });

    if (fatiguedPlayers.length > 0 && minute > 60) {
      return {
        playerId: fatiguedPlayers[0].playerId,
        reason: 'fatigue',
      };
    }

    // Tactical substitutions late in game
    if (minute > 75) {
      if (isLosing && isClose) {
        // Remove a defender, add an attacker
        const defenders = this.startingXI.filter(
          (p) => p.position.includes('CB') || p.position.includes('LB') || p.position.includes('RB')
        );
        if (defenders.length > 0) {
          return { playerId: defenders[0].playerId, reason: 'tactical - need attack' };
        }
      } else if (isWinning && isClose) {
        // Add defensive reinforcement
        const attackers = this.startingXI.filter(
          (p) => p.position.includes('ST') || p.position.includes('CM')
        );
        if (attackers.length > 0) {
          return { playerId: attackers[0].playerId, reason: 'tactical - need defense' };
        }
      }
    }

    return null;
  }

  recordSubstitution(): void {
    this.substitutions++;
  }

  getRemainingSubstitutions(): number {
    return this.maxSubstitutions - this.substitutions;
  }
}
