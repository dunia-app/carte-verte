import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class SendNotificationsCommand extends Command<null> {
  constructor(props: CommandProps<SendNotificationsCommand>) {
    super(props)
    this.total = props.total
    this.lessThanDate = props.lessThanDate
  }

  readonly total: number

  readonly lessThanDate: Date
}
