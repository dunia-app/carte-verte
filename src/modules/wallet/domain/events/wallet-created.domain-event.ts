import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class WalletCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<WalletCreatedDomainEvent>) {
    super(props)
    this.employeeId = props.employeeId
    this.name = props.name
  }

  readonly employeeId: string

  readonly name: string
}
