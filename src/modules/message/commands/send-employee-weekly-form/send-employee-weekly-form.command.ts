import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

export class SendEmployeeWeeklyFormCommand extends Command<null> {
  constructor(props: CommandProps<SendEmployeeWeeklyFormCommand>) {
    super(props)
  }
}
