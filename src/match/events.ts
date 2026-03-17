import { Observable, Subject } from 'rxjs';

export interface MatchEvent {
  minute: number;
  type: EventType;
  playerId?: number;
  teamId?: number;
  details: string;
  // Additional data for specific event types
  data?: Record<string, unknown>;
}

export type EventType =
  | 'match-start'
  | 'minute-passed'
  | 'goal'
  | 'yellow-card'
  | 'red-card'
  | 'substitution'
  | 'injury'
  | 'penalty'
  | 'missed-penalty'
  | 'own-goal'
  | 'half-time'
  | 'full-time'
  | 'match-end';

export class EventManager {
  private eventSubject: Subject<MatchEvent> = new Subject();

  readonly events$: Observable<MatchEvent> = this.eventSubject.asObservable();

  emit(event: MatchEvent): void {
    this.eventSubject.next(event);
  }

  complete(): void {
    this.eventSubject.complete();
  }
}
