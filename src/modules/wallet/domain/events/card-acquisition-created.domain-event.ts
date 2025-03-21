import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class CardAcquisitionCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<CardAcquisitionCreatedDomainEvent>) {
    super(props)
    this.externalCardAcquisitionId = props.externalCardAcquisitionId
    this.employeeId = props.employeeId
  }

  readonly externalCardAcquisitionId: string

  readonly employeeId: string
}
