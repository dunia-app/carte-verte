import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class ExternalWalletCreditAuthorizedBalanceDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(
    props: DomainEventProps<ExternalWalletCreditAuthorizedBalanceDomainEvent>,
  ) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
    this.transactionExternalPaymentId = props.transactionExternalPaymentId
  }

  readonly employeeId: string

  readonly amount: number

  readonly transactionExternalPaymentId: string
}
