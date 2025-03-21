import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class EmployeeAskNewSmsTokenDomainEvent extends DomainEvent {
  persistEvent: boolean = false
  constructor(props: DomainEventProps<EmployeeAskNewSmsTokenDomainEvent>) {
    super(props)
    this.email = props.email
    this.mobile = props.mobile
    this.mobileToken = props.mobileToken
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly mobile: string

  readonly mobileToken: string

  readonly deviceId?: string
}
