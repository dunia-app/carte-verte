import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class DestroyedCardBlockedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<DestroyedCardBlockedDomainEvent>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
