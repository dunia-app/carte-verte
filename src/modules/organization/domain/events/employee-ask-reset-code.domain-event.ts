import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeAskResetCodeDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(props: DomainEventProps<EmployeeAskResetCodeDomainEvent>) {
    super(props)
    this.userId = props.userId
  }

  readonly userId: string
}
