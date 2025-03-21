import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeCodeTooManyFailedAttemptDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(
    props: DomainEventProps<EmployeeCodeTooManyFailedAttemptDomainEvent>,
  ) {
    super(props)
    this.userId = props.userId
  }

  readonly userId: string
}
