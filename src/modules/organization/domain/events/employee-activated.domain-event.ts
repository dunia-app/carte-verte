import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeActivatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<EmployeeActivatedDomainEvent>) {
    super(props)
    this.userId = props.userId
    this.organizationId = props.organizationId
  }

  readonly userId: string

  readonly organizationId: string
}
