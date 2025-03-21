import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardAcquisitionOverdraftCommand } from './update-card-acquisition-overdraft.command'
import { updateCardAcquisitionOverdraft } from './update-card-acquisition-overdraft.service'

@CommandHandler(UpdateCardAcquisitionOverdraftCommand)
export class UpdateCardAcquisitionOverdraftCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardAcquisitionOverdraftCommand) {
    return updateCardAcquisitionOverdraft(
      command,
      this.unitOfWork,
      this.baas,
      this.cardAcquisitionService,
    )
  }
}
