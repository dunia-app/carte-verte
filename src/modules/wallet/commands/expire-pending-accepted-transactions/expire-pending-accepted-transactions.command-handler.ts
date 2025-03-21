import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ExpirePendingAcceptedTransactionsCommand } from './expire-pending-accepted-transactions.command'
import { expirePendingAcceptedTransactions } from './expire-pending-accepted-transactions.service'

@CommandHandler(ExpirePendingAcceptedTransactionsCommand)
export class ExpirePendingAcceptedTransactionsCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: ExpirePendingAcceptedTransactionsCommand) {
    return expirePendingAcceptedTransactions(command, this.unitOfWork)
  }
}
