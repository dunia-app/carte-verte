import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { UUID } from '../../../../libs/ddd/domain/value-objects/uuid.value-object'

// Command is a plain object with properties
export class CreateSuperAdminCommand extends Command<UUID> {
  constructor(props: CommandProps<CreateSuperAdminCommand>) {
    super(props)
    this.userId = props.userId
    this.password = props.password
  }

  readonly userId: string

  readonly password: string
}
