import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'
import { NotFoundException } from '../../../../libs/exceptions/index'

// Command is a plain object with properties
export class DistributeCashbackAdminCommand extends Command<
  Number,
  NotFoundException
> {
  constructor(props: CommandProps<DistributeCashbackAdminCommand>) {
    super(props)
    this.transactionId = props.transactionId
  }

  readonly transactionId: string
}
