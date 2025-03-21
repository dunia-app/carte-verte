import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class AskNewEmployeeSmsTokenCommand extends Command<
  string,
  EmployeeFrozenError | EmployeeNotFoundError
> {
  constructor(props: CommandProps<AskNewEmployeeSmsTokenCommand>) {
    super(props)
    this.email = props.email
    this.mobile = props.mobile
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly mobile: string

  readonly deviceId?: string
}
