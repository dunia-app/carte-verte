import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class CaptureCardAcquisitionPayinCommand extends Command<
  null,
  ExceptionBase
> {
  constructor(props: CommandProps<CaptureCardAcquisitionPayinCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
    this.transactionExternalPaymentId = props.transactionExternalPaymentId
  }

  readonly employeeId: string

  readonly amount: number

  readonly transactionExternalPaymentId: string
}
