import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class CancelCardAcquisitionPayinCommand extends Command<
  null,
  ExceptionBase
> {
  constructor(props: CommandProps<CancelCardAcquisitionPayinCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.transactionExternalPaymentId = props.transactionExternalPaymentId
  }

  readonly employeeId: string

  readonly transactionExternalPaymentId?: string
}
