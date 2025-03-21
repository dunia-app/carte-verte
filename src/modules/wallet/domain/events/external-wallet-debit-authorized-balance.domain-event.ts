import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'

// DomainEvent is a plain object with properties
export class ExternalWalletDebitAuthorizedBalanceDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(
    props: DomainEventProps<ExternalWalletDebitAuthorizedBalanceDomainEvent>,
  ) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
    this.cashbackAmount = props.cashbackAmount
    this.transactionExternalPaymentId = props.transactionExternalPaymentId
  }

  readonly employeeId: string

  readonly amount: number

  readonly cashbackAmount: number

  readonly transactionExternalPaymentId: string
}
