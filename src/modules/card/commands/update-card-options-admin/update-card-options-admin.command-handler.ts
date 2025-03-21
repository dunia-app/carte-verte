import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardOptionsAdminCommand } from './update-card-options-admin.command'
import { updateCardOptionsAdmin } from './update-card-options-admin.service'

@CommandHandler(UpdateCardOptionsAdminCommand)
export class UpdateCardOptionsAdminCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardOptionsAdminCommand) {
    return updateCardOptionsAdmin(command, this.unitOfWork, this.baas)
  }
}
