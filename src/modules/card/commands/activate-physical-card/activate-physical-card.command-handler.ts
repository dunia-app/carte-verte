import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { ActivatePhysicalCardCommand } from './activate-physical-card.command'
import { activatePhysicalCard } from './activate-physical-card.service'

@CommandHandler(ActivatePhysicalCardCommand)
export class ActivatePhysicalCardCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: ActivatePhysicalCardCommand) {
    return activatePhysicalCard(command, this.unitOfWork, this.baas)
  }
}
