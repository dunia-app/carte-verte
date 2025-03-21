import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class LoginEmployeeNewDeviceIdCommand extends Command<
  EmployeeLoginResp,
  | EmployeeNotActivatedError
  | WrongEmployeeCodeError
  | EmployeeCodeTooManyFailedAttemptError
  | EmployeeFrozenError
  | EmployeeNotFoundError
> {
  constructor(props: CommandProps<LoginEmployeeNewDeviceIdCommand>) {
    super(props)
    this.email = props.email
    this.employeeId = props.employeeId
    this.code = props.code
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly employeeId: string

  readonly code: string

  readonly deviceId: string
}
