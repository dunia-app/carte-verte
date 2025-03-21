import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeCodeTooManyFailedAttemptError,
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  WrongEmployeeCodeError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class UpdateEmployeeCodeCommand extends Command<
  EmployeeLoginResp,
  | WrongEmployeeCodeError
  | EmployeeCodeTooManyFailedAttemptError
  | EmployeeCodeFormatNotCorrectError
  | EmployeeNotActivatedError
  | EmployeeFrozenError
> {
  constructor(props: CommandProps<UpdateEmployeeCodeCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.currentCode = props.currentCode
    this.newCode = props.newCode
  }

  readonly employeeId: string

  readonly currentCode: string

  readonly newCode: string
}
