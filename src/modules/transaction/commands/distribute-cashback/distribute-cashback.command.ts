import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'
import { NotFoundException } from '../../../../libs/exceptions/index'
import { TransactionStatus } from '../../domain/entities/transaction.types'

// Command is a plain object with properties
export class DistributeCashbackCommand extends Command<
  number,
  NotFoundException
> {
  constructor(props: CommandProps<DistributeCashbackCommand>) {
    super(props)
    this.walletId = props.walletId
    this.employeeId = props.employeeId
    this.cashbackableAmount = props.cashbackableAmount
    this.paymentDate = props.paymentDate
    this.merchantName = props.merchantName
    this.transactionStatus = props.transactionStatus
    this.cashbackId = props.cashbackId
  }

  readonly walletId: UUID

  readonly employeeId: string

  readonly cashbackableAmount: number

  readonly paymentDate: Date

  readonly merchantName: string

  readonly transactionStatus: TransactionStatus

  readonly cashbackId?: UUID
}
