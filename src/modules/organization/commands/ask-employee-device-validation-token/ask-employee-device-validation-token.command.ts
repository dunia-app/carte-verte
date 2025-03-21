import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'
import { DeviceValidationMethod } from './ask-employee-device-validation-token.request.dto'

// Command is a plain object with properties
export class AskEmployeeDeviceValidationTokenCommand extends Command<
  string,
  EmployeeFrozenError | EmployeeNotFoundError
> {
  constructor(props: CommandProps<AskEmployeeDeviceValidationTokenCommand>) {
    super(props)
    this.email = props.email
    this.deviceId = props.deviceId
    this.method = props.method
  }

  readonly email: string

  readonly deviceId: string

  readonly method: DeviceValidationMethod
}
