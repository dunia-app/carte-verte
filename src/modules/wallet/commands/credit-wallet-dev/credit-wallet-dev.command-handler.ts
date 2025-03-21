import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CreditWalletDevCommand } from './credit-wallet-dev.command'
import { creditWalletDev } from './credit-wallet-dev.service'

@CommandHandler(CreditWalletDevCommand)
export class CreditWalletDevCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: CreditWalletDevCommand) {
    return creditWalletDev(command, this.unitOfWork)
  }
}
