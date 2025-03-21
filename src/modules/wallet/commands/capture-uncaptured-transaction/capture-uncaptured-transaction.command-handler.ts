import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { ConfigService } from '../../../../infrastructure/config/config.service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { CaptureUncapturedTransactionCommand } from './capture-uncaptured-transaction.command'
import { captureUncapturedTransaction } from './capture-uncaptured-transaction.service'

@CommandHandler(CaptureUncapturedTransactionCommand)
export class CaptureUncapturedTransactionCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly config: ConfigService,
    private readonly baas: Baas,
    private readonly cardAcquisition: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: CaptureUncapturedTransactionCommand) {
    return captureUncapturedTransaction(
      command,
      this.unitOfWork,
      this.config,
      this.baas,
      this.cardAcquisition,
    )
  }
}
