import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardPinChangedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardPinChangedDomainEvent>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
