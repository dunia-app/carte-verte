import { DomainEvent, DomainEventClass, DomainEvents } from './index'

export abstract class DomainEventHandler {
  constructor(private readonly event: DomainEventClass) {}

  abstract handle(events: DomainEvent[]): Promise<void>

  public listen(): void {
    DomainEvents.subscribe(this.event, this)
  }
}
