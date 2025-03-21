import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class OrganizationAdminCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(props: DomainEventProps<OrganizationAdminCreatedDomainEvent>) {
    super(props)
    this.userId = props.userId
    this.organizationId = props.organizationId
  }

  readonly userId: string

  readonly organizationId: string
}
