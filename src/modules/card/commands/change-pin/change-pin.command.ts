import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { WrongPinError } from '../../../../libs/ddd/domain/ports/baas.port'
import {
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class ChangePinCommand extends Command<
  boolean,
  CardPinAlreadySetError | CardPinFormatNotCorrectError | WrongPinError
> {
  constructor(props: CommandProps<ChangePinCommand>) {
    super(props)
    this.currentPin = props.currentPin
    this.newPin = props.newPin
    this.confirmPin = props.confirmPin
    this.employeeId = props.employeeId
  }

  readonly employeeId: string

  readonly currentPin: string

  readonly newPin: string

  readonly confirmPin: string
}
