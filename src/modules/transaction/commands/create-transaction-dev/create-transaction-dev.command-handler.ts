import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { Result } from '../../../../libs/ddd/domain/utils/result.util'
import { TransactionAlreadyExistsError } from '../../errors/transaction.errors'
import { CreateTransactionDevCommand } from './create-transaction-dev.command'
import { createTransactionDev } from './create-transaction-dev.service'

@CommandHandler(CreateTransactionDevCommand)
export class CreateTransactionDevCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(
    command: CreateTransactionDevCommand,
  ): Promise<Result<number, TransactionAlreadyExistsError>> {
    return createTransactionDev(command, this.unitOfWork)
  }
}
