import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
  EmployeeNotFoundError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class LoginEmployeeCommand extends Command<
  EmployeeLoginResp,
  | EmployeeNotActivatedError
  | WrongEmployeeCodeError
  | EmployeeCodeTooManyFailedAttemptError
  | EmployeeNewDeviceNotValidated
  | EmployeeFrozenError
  | EmployeeNotFoundError
> {
  constructor(props: CommandProps<LoginEmployeeCommand>) {
    super(props)
    this.email = props.email
    this.code = props.code
    this.deviceId = props.deviceId
    this.chechDeviceId = props.chechDeviceId
  }

  readonly email: string

  readonly code: string

  // TO DO: nullable is to be deprecated and deviceId will be mandatory
  readonly deviceId?: string

  readonly chechDeviceId: boolean
}
