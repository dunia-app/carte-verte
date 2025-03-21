import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class OrganizationAdminRequestCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(
    props: DomainEventProps<OrganizationAdminRequestCreatedDomainEvent>,
  ) {
    super(props)
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.email = props.email
    this.organizationName = props.organizationName
    this.numberOfEmployee = props.numberOfEmployee
  }

  readonly firstname: string

  readonly lastname: string

  readonly email: string

  readonly organizationName: string

  readonly numberOfEmployee: string
}
