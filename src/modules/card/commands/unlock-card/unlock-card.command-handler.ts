import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UnlockCardCommand } from './unlock-card.command'
import { unlockCard } from './unlock-card.service'

@CommandHandler(UnlockCardCommand)
export class UnlockCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: UnlockCardCommand) {
    return unlockCard(command, this.unitOfWork, this.baas)
  }
}
