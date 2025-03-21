import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeUnfrozenDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<EmployeeUnfrozenDomainEvent>) {
    super(props)
  }
}
