import {
  DomainEvent,
  DomainEventProps,
} from '../../../../libs/ddd/domain/domain-events/index'
import {
  TransactionDeclinedReason,
  TransactionStatus,
} from '../entities/transaction.types'
import { TransactionAdvantageRepartition } from '../value-objects/transaction-advantage-repartition.value-object'

// DomainEvent is a plain object with properties
export class TransactionCreatedDomainEvent extends DomainEvent {
  persistEvent: boolean = true
  constructor(props: DomainEventProps<TransactionCreatedDomainEvent>) {
    super(props)
    this.employeeId = props.employeeId
    this.merchantName = props.merchantName
    this.mid = props.mid
    this.amount = props.amount
    this.transactionStatus = props.transactionStatus
    this.externalPaymentId = props.externalPaymentId
    this.declinedReason = props.declinedReason
    this.advantageRepartition = props.advantageRepartition
    this.preAuthorizationAmount = props.preAuthorizationAmount
    this.paymentDate = props.paymentDate
    this.cashbackAmount = props.cashbackAmount
  }

  readonly employeeId: string

  readonly merchantName: string

  readonly mid: string

  readonly amount: number

  readonly transactionStatus: TransactionStatus

  readonly externalPaymentId: string

  readonly declinedReason?: TransactionDeclinedReason

  readonly advantageRepartition: TransactionAdvantageRepartition

  readonly preAuthorizationAmount?: number

  readonly paymentDate: Date

  readonly cashbackAmount?: number
}
