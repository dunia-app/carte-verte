import { CommandHandler } from '@nestjs/cqrs'
import { Baas } from '../../../../infrastructure/baas/baas'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AuthorizeCardAcquisitionPayinCommand } from './authorize-card-acquisition-payin.command'
import { authorizeCardAcquisitionPayin } from './authorize-card-acquisition-payin.service'

@CommandHandler(AuthorizeCardAcquisitionPayinCommand)
export class AuthorizeCardAcquisitionPayinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private baas: Baas,
    private cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: AuthorizeCardAcquisitionPayinCommand) {
    return authorizeCardAcquisitionPayin(
      command,
      this.unitOfWork,
      this.baas,
      this.cardAcquisitionService,
    )
  }
}
