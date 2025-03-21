import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardLimitAdminCommand } from './update-card-limit-admin.command'
import { updateCardLimitAdmin } from './update-card-limit-admin.service'

@CommandHandler(UpdateCardLimitAdminCommand)
export class UpdateCardLimitAdminCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardLimitAdminCommand) {
    return updateCardLimitAdmin(command, this.unitOfWork, this.baas)
  }
}
