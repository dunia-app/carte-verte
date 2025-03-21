import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeCodeFormatNotCorrectError,
  EmployeeFrozenError,
  EmployeeNewDeviceNotValidated,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class SetEmployeeCodeCommand extends Command<
  EmployeeLoginResp,
  | EmployeeNewDeviceNotValidated
  | EmployeeCodeFormatNotCorrectError
  | EmployeeNotActivatedError
  | EmployeeFrozenError
> {
  constructor(props: CommandProps<SetEmployeeCodeCommand>) {
    super(props)
    this.email = props.email
    this.code = props.code
    this.deviceId = props.deviceId
  }

  readonly email: string

  readonly code: string

  readonly deviceId?: string
}
