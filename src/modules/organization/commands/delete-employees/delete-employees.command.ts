import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class DeleteEmployeesCommand extends Command<null> {
  constructor(props: CommandProps<DeleteEmployeesCommand>) {
    super(props)
  }
}
