import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { EmployeeNotActivatedError } from '../../../organization/errors/employee.errors'

// Command is a plain object with properties
export class CreditWalletDevCommand extends Command<
  number,
  EmployeeNotActivatedError
> {
  constructor(props: CommandProps<CreditWalletDevCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.amount = props.amount
  }

  readonly employeeId: string

  readonly amount: number
}
