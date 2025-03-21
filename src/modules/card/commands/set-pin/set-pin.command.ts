import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  CardPinAlreadySetError,
  CardPinFormatNotCorrectError,
} from '../../errors/card.errors'

// Command is a plain object with properties
export class SetPinCommand extends Command<
  boolean,
  CardPinAlreadySetError | CardPinFormatNotCorrectError
> {
  constructor(props: CommandProps<SetPinCommand>) {
    super(props)
    this.newPin = props.newPin
    this.confirmPin = props.confirmPin
    this.employeeId = props.employeeId
  }

  readonly employeeId: string

  readonly newPin: string

  readonly confirmPin: string
}
