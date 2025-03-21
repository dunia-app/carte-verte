import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class SendPinChangedNotifCommand extends Command<null> {
  constructor(props: CommandProps<SendPinChangedNotifCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
