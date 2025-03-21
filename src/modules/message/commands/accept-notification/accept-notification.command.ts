import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class AcceptNotificationCommand extends Command<Boolean> {
  constructor(props: CommandProps<AcceptNotificationCommand>) {
    super(props)
    this.userId = props.userId
    this.acceptNotification = props.acceptNotification
  }

  readonly userId: string

  readonly acceptNotification: boolean
}
