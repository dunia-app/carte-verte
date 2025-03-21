import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AffectBalanceTransferCommand } from './affect-balance-transfer.command'
import { affectBalanceTransfer } from './affect-balance-transfer.service'

@CommandHandler(AffectBalanceTransferCommand)
export class AffectBalanceTransferCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: AffectBalanceTransferCommand) {
    return affectBalanceTransfer(command, this.unitOfWork)
  }
}
