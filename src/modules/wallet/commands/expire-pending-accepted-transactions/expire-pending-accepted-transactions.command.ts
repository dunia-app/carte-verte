import {
  Command,
  CommandProps,
} from '../../../../libs/ddd/domain/base-classes/command.base'

// Command is a plain object with properties
export class ExpirePendingAcceptedTransactionsCommand extends Command<number> {
  constructor(props: CommandProps<ExpirePendingAcceptedTransactionsCommand>) {
    super(props)
  }
}
