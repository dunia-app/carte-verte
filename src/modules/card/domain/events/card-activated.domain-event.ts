import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardActivatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardActivatedDomainEvent>) {
    super(props)
  }
}
