import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardAcquisitionPayinCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardAcquisitionPayinCreatedDomainEvent>) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
  }

  readonly employeeId: string

  readonly amount: number
}
