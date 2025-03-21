import { DomainEvent, DomainEventProps } from "../../../../libs/ddd/domain/domain-events/domain-event.base"

// DomainEvent is a plain object with properties
export class CardAcquisitionPayinCapturedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(
    props: DomainEventProps<CardAcquisitionPayinCapturedDomainEvent>,
  ) {
    super(props)
    this.amount = props.amount
    this.employeeId = props.employeeId
  }

  readonly amount: number

  readonly employeeId: string
}
