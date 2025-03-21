import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions'

// Command is a plain object with properties
export class CaptureUncapturedTransactionCommand extends Command<
  number,
  ExceptionBase
> {
  constructor(props: CommandProps<CaptureUncapturedTransactionCommand>) {
    super(props)
  }
}
