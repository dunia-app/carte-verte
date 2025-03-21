import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class UpdateCardOptionsAdminCommand extends Command<
  number,
  ExceptionBase
> {
  constructor(props: CommandProps<UpdateCardOptionsAdminCommand>) {
    super(props)
    this.nfc = props.nfc
    this.foreign = props.foreign
    this.online = props.online
  }

  readonly nfc?: boolean

  readonly foreign?: boolean

  readonly online?: boolean
}
