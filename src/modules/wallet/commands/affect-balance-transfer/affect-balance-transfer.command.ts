import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'
import { TransferDirection } from '../../../transaction/domain/entities/transfer.types'

// Command is a plain object with properties
export class AffectBalanceTransferCommand extends Command<null, ExceptionBase> {
  constructor(props: CommandProps<AffectBalanceTransferCommand>) {
    super(props)
    this.walletId = props.walletId
    this.amount = props.amount
    this.transferDirection = props.transferDirection
  }

  readonly walletId: string

  readonly amount: number

  readonly transferDirection: TransferDirection
}
