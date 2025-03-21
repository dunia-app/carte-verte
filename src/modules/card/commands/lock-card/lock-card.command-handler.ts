import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { LockCardCommand } from './lock-card.command'
import { lockCard } from './lock-card.service'

@CommandHandler(LockCardCommand)
export class LockCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: LockCardCommand) {
    return lockCard(command, this.unitOfWork, this.baas)
  }
}
