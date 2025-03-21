import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeAlreadyActivatedError,
  EmployeeAlreadyExistsError,
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class SetEmployeeAccountCommand extends Command<
  EmployeeLoginResp,
  | EmployeeNewDeviceNotValidated
  | EmployeeCodeFormatNotCorrectError
  | EmployeeAlreadyActivatedError
  | EmployeeAlreadyExistsError
  | EmployeeFrozenError
> {
  constructor(props: CommandProps<SetEmployeeAccountCommand>) {
    super(props)
    this.email = props.email
    this.code = props.code
    this.mobile = props.mobile
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly code: string

  readonly mobile: string

  readonly deviceId?: string
}
