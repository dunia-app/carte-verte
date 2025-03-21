import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class PushReceiverDeviceTokenCommand extends Command<string> {
  constructor(props: CommandProps<PushReceiverDeviceTokenCommand>) {
    super(props)
    this.userId = props.userId
    this.deviceToken = props.deviceToken
    this.deviceId = props.deviceId
  }

  readonly userId: string

  readonly deviceToken: string

  readonly deviceId: string
}
