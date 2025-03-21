import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class ValidateCardAcquisitionPayinCaptureCommand extends Command<
  string,
  ExceptionBase
> {
  constructor(props: CommandProps<ValidateCardAcquisitionPayinCaptureCommand>) {
    super(props)
    this.payinReference = props.payinReference
    this.externalPayinId = props.externalPayinId
    this.amount = props.amount
  }

  readonly payinReference: string

  readonly externalPayinId: string

  readonly amount: number
}
