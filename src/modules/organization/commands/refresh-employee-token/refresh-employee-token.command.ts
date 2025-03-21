import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeLoginResp } from '../../dtos/employee.response.dto'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
  EmployeeRefreshTokenError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class RefreshEmployeeTokenCommand extends Command<
  EmployeeLoginResp,
  EmployeeRefreshTokenError | EmployeeNotActivatedError | EmployeeFrozenError
> {
  constructor(props: CommandProps<RefreshEmployeeTokenCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.refreshToken = props.refreshToken
    this.deviceId = props.deviceId
  }

  readonly employeeId: string

  readonly refreshToken: string

  readonly deviceId?: string
}
