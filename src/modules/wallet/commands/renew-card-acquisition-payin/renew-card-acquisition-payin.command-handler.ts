import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { RenewCardAcquisitionPayinCommand } from './renew-card-acquisition-payin.command'
import { renewCardAcquisitionPayin } from './renew-card-acquisition-payin.service'

@CommandHandler(RenewCardAcquisitionPayinCommand)
export class RenewCardAcquisitionPayinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    protected readonly baas: Baas,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: RenewCardAcquisitionPayinCommand) {
    return renewCardAcquisitionPayin(
      command,
      this.unitOfWork,
      this.baas,
      this.cardAcquisitionService,
    )
  }
}
