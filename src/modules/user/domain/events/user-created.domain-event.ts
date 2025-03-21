import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import { UserRoles } from '../entities/user.types'

// DomainEvent is a plain object with properties
export class UserCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<UserCreatedDomainEvent>) {
    super(props)
    this.firstname = props.firstname
    this.role = props.role
  }

  readonly firstname: string

  readonly role: UserRoles
}
