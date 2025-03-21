import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class SendEmployeeRegisterEmailCommand extends Command<null> {
  constructor(props: CommandProps<SendEmployeeRegisterEmailCommand>) {
    super(props)
    this.userIds = props.userIds
    this.organizationId = props.organizationId
  }

  readonly userIds: string[]

  readonly organizationId: string
}
