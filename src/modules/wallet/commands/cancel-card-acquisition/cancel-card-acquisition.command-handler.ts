import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CancelCardAcquisitionCommand } from './cancel-card-acquisition.command'
import { cancelCardAcquisition } from './cancel-card-acquisition.service'

@CommandHandler(CancelCardAcquisitionCommand)
export class CancelCardAcquisitionCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: CancelCardAcquisitionCommand) {
    return cancelCardAcquisition(
      command,
      this.unitOfWork,
      this.baas,
      this.cardAcquisitionService,
    )
  }
}
