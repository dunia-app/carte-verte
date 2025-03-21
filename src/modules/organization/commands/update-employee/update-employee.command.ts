import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeNotFoundError } from '../../errors/employee.errors'

// Command is a plain object with properties
export class UpdateEmployeeCommand extends Command<
  string,
  EmployeeNotFoundError
> {
  constructor(props: CommandProps<UpdateEmployeeCommand>) {
    super(props)
    this.organizationId = props.organizationId
    this.employeeId = props.employeeId
    this.firstname = props.firstname
    this.lastname = props.lastname
  }

  readonly organizationId: string

  readonly employeeId: string

  readonly firstname?: string

  readonly lastname?: string
}
