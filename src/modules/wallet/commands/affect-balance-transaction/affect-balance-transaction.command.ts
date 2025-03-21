import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { TransactionStatus } from '../../../transaction/domain/entities/transaction.types'
import { TransactionAdvantageRepartition } from '../../../transaction/domain/value-objects/transaction-advantage-repartition.value-object'

// Command is a plain object with properties
export class AffectBalanceTransactionCommand extends Command<
  null,
  ExceptionBase
> {
  constructor(props: CommandProps<AffectBalanceTransactionCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
    this.transactionStatus = props.transactionStatus
    this.transactionId = props.transactionId
    this.externalPaymentId = props.externalPaymentId
    this.advantageRepartition = props.advantageRepartition
    this.preAuthorizationAmount = props.preAuthorizationAmount
    this.cashbackAmount = props.cashbackAmount
  }

  readonly employeeId: string

  readonly amount: number

  readonly transactionStatus: TransactionStatus

  readonly transactionId: string

  readonly externalPaymentId: string

  readonly advantageRepartition: TransactionAdvantageRepartition

  readonly preAuthorizationAmount?: number

  readonly cashbackAmount?: number
}
