import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import {
  EmployeeFrozenError,
  EmployeeNotActivatedError,
} from '../../errors/employee.errors'

// Command is a plain object with properties
export class AskResetEmployeeCodeCommand extends Command<
  boolean,
  EmployeeNotActivatedError | EmployeeFrozenError
> {
  constructor(props: CommandProps<AskResetEmployeeCodeCommand>) {
    super(props)
    this.email = props.email.toLocaleLowerCase()
  }

  readonly email: string
}
