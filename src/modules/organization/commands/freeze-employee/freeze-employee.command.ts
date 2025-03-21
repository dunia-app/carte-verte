import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeAlreadyFrozenError } from '../../errors/employee.errors'

// Command is a plain object with properties
export class FreezeEmployeeCommand extends Command<
  boolean,
  EmployeeAlreadyFrozenError
> {
  constructor(props: CommandProps<FreezeEmployeeCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
