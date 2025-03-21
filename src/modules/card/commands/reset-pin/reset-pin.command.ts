import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  CardPinFormatNotCorrectError,
  CardPinNotSetError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class ResetPinCommand extends Command<
  boolean,
  CardPinNotSetError | CardPinFormatNotCorrectError
> {
  constructor(props: CommandProps<ResetPinCommand>) {
    super(props)
    this.newPin = props.newPin
    this.confirmPin = props.confirmPin
    this.employeeId = props.employeeId
  }

  readonly employeeId: string

  readonly newPin: string

  readonly confirmPin: string
}
