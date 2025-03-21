import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class DeletePdfFilesCommand extends Command<String> {
  constructor(props: CommandProps<DeletePdfFilesCommand>) {
    super(props)
  }
}
