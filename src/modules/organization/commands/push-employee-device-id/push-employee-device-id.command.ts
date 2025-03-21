import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class PushEmployeeDeviceIdCommand extends Command<
  string,
  ExceptionBase
> {
  constructor(props: CommandProps<PushEmployeeDeviceIdCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.deviceId = props.deviceId
  }

  readonly employeeId: string

  readonly deviceId: string
}
