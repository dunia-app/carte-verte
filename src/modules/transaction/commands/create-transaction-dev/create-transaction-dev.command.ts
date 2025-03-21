import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class CreateTransactionDevCommand extends Command<number> {
  constructor(props: CommandProps<CreateTransactionDevCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.toCreate = props.toCreate
    this.today = props.today
    this.amount = props.amount
  }

  readonly employeeId: string

  readonly toCreate: number

  readonly today: boolean

  readonly amount?: number
}
