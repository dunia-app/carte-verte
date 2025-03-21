import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class OrganizationAdminRequestAcceptedDomainEvent extends DomainEvent {
  persistEvent: boolean = false

  constructor(
    props: DomainEventProps<OrganizationAdminRequestAcceptedDomainEvent>,
  ) {
    super(props)
    this.firstname = props.firstname
    this.lastname = props.lastname
    this.email = props.email
  }

  readonly firstname: string

  readonly lastname: string

  readonly email: string
}
