import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class UserDeletedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<UserDeletedDomainEvent>) {
    super(props)
  }
}
