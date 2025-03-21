import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeAlreadyAcceptedCguError,
  EmployeeFrozenError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class AcceptCguCommand extends Command<
  Boolean,
  EmployeeAlreadyAcceptedCguError | EmployeeFrozenError
> {
  constructor(props: CommandProps<AcceptCguCommand>) {
    super(props)
    this.employeeId = props.employeeId
  }

  readonly employeeId: string
}
