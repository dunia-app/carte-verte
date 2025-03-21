import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class UpdateCardPinTryExceededCommand extends Command<boolean> {
  constructor(props: CommandProps<UpdateCardPinTryExceededCommand>) {
    super(props)
    this.externalCardId = props.externalCardId
    this.pinTryExceeded = props.pinTryExceeded
  }

  readonly externalCardId: string

  readonly pinTryExceeded: boolean
}
