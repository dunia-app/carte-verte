import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(props: DomainEventProps<EmployeeCreatedDomainEvent>) {
    super(props)
    this.userId = props.userId
    this.organizationId = props.organizationId
  }

  readonly userId: string

  readonly organizationId: string
}
