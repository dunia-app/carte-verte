import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CaptureCardAcquisitionPayinCommand } from './capture-card-acquisition-payin.command'
import { captureCardAcquisitionPayin } from './capture-card-acquisition-payin.service'

@CommandHandler(CaptureCardAcquisitionPayinCommand)
export class CaptureCardAcquisitionPayinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: CaptureCardAcquisitionPayinCommand) {
    return captureCardAcquisitionPayin(
      command,
      this.unitOfWork,
      this.baas,
      this.cardAcquisitionService,
    )
  }
}
