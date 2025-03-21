import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AffectBalanceTransactionCommand } from './affect-balance-transaction.command'
import { affectBalanceTransaction } from './affect-balance-transaction.service'

@CommandHandler(AffectBalanceTransactionCommand)
export class AffectBalanceTransactionCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: AffectBalanceTransactionCommand) {
    return affectBalanceTransaction(command, this.unitOfWork)
  }
}
