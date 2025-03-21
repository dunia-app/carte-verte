import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CreateWalletCommand } from './create-wallet.command'
import { createWallet } from './create-wallet.service'

@CommandHandler(CreateWalletCommand)
export class CreateWalletCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: CreateWalletCommand) {
    return createWallet(command, this.unitOfWork)
  }
}
