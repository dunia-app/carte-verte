import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class AuthorizeCardAcquisitionPayinCommand extends Command<
  string,
  ExceptionBase
> {
  constructor(props: CommandProps<AuthorizeCardAcquisitionPayinCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.transactionExternalPaymentId = props.transactionExternalPaymentId
    this.amount = props.amount
  }

  readonly employeeId: string

  readonly transactionExternalPaymentId: string

  readonly amount: number
}
