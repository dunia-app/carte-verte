import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { ExceptionBase } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class UpdateCardAcquisitionOverdraftCommand extends Command<
  number,
  ExceptionBase
> {
  constructor(props: CommandProps<UpdateCardAcquisitionOverdraftCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.externalEmployeeId = props.externalEmployeeId
    this.overdraftLimit = props.overdraftLimit
  }

  readonly employeeId: string

  readonly externalEmployeeId: string

  readonly overdraftLimit: number
}
