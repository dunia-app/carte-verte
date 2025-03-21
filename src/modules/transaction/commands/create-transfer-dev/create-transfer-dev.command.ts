import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class CreateTransferDevCommand extends Command<number> {
  constructor(props: CommandProps<CreateTransferDevCommand>) {
    super(props)
    this.employeeId = props.employeeId
    this.toCreate = props.toCreate
    this.amount = props.amount
  }

  readonly employeeId: string

  readonly toCreate: number

  readonly amount?: number
}
