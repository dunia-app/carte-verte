import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardUnlockedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardUnlockedDomainEvent>) {
    super(props)
  }
}
