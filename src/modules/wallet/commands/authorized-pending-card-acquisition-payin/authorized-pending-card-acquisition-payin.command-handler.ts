import { CommandHandler } from '@nestjs/cqrs'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AuthorizePendingCardAcquisitionPayinCommand } from './authorized-pending-card-acquisition-payin.command'
import { authorizePendingCardAcquisitionPayin } from './authorized-pending-card-acquisition-payin.service'

@CommandHandler(AuthorizePendingCardAcquisitionPayinCommand)
export class AuthorizePendingCardAcquisitionPayinCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: AuthorizePendingCardAcquisitionPayinCommand) {
    return authorizePendingCardAcquisitionPayin(
      command,
      this.unitOfWork,
      this.cardAcquisitionService,
    )
  }
}
