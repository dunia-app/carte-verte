import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeFrozenError,
  EmployeeNotFoundError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class AskNewEmployeeLoginTokenCommand extends Command<
  boolean,
  EmployeeNotFoundError | EmployeeFrozenError
> {
  constructor(props: CommandProps<AskNewEmployeeLoginTokenCommand>) {
    super(props)
    this.email = props.email.toLocaleLowerCase()
  }

  readonly email: string
}
