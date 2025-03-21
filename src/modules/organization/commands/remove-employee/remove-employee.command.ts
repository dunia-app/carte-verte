import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class RemoveEmployeeCommand extends Command<string> {
  constructor(props: CommandProps<RemoveEmployeeCommand>) {
    super(props)
    this.organizationId = props.organizationId
    this.employeeId = props.employeeId
  }

  readonly organizationId: string

  readonly employeeId: string
}
