import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class SendEmployeeAccountCreationReminderCommand extends Command<null> {
  constructor(props: CommandProps<SendEmployeeAccountCreationReminderCommand>) {
    super(props)
  }
}
