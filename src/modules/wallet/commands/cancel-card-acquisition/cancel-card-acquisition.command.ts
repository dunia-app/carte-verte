import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class CancelCardAcquisitionCommand extends Command<
  boolean,
  ExceptionBase
> {
  constructor(props: CommandProps<CancelCardAcquisitionCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
  }

  readonly employeeId: string

  readonly externalEmployeeId: string
}
