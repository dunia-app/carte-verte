import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeAlreadyUnfrozenError } from '../../errors/employee.errors'

// Command is a plain object with properties
export class UnfreezeEmployeeCommand extends Command<
  boolean,
  EmployeeAlreadyUnfrozenError
> {
  constructor(props: CommandProps<UnfreezeEmployeeCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
