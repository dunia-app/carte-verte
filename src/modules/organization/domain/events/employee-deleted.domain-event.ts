import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeDeletedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<EmployeeDeletedDomainEvent>) {
    super(props)
    this.organizationId = props.organizationId
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.externalEmployeeId = props.externalEmployeeId
  }

  readonly organizationId: string

  readonly firstname: string

  readonly lastname: string

  readonly externalEmployeeId?: string
}
