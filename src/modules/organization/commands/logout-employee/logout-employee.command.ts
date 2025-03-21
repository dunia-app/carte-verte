import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class LogoutEmployeeCommand extends Command<
  boolean,
  EmployeeFrozenError | EmployeeNotFoundError
> {
  constructor(props: CommandProps<LogoutEmployeeCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.refreshToken = props.refreshToken
    this.deviceId = props.deviceId
  }

  readonly employeeId: string

  readonly refreshToken: string

  readonly deviceId: string
}
