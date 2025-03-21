import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

// DomainEvent is a plain object with properties
export class PhysicalCardRequestedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<PhysicalCardRequestedDomainEvent>) {
    super(props)
    this.city = props.city
    this.postalCode = props.postalCode
    this.street = props.street
    this.employeeId = props.employeeId
  }

  readonly city: string

  readonly postalCode: string

  readonly street: string

  readonly employeeId: UUID
}
