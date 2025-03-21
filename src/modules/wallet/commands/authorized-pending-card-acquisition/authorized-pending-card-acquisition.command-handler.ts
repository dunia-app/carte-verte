import { CommandHandler } from '@nestjs/cqrs'
import { CardAcquisitionService } from '../../../../infrastructure/card-acquisition-service/card-acquisition-service'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { AuthorizePendingCardAcquisitionCommand } from './authorized-pending-card-acquisition.command'
import { authorizePendingCardAcquisition } from './authorized-pending-card-acquisition.service'

@CommandHandler(AuthorizePendingCardAcquisitionCommand)
export class AuthorizePendingCardAcquisitionCommandHandler extends CommandHandlerBase {
  constructor(
    protected readonly unitOfWork: UnitOfWork,
    private readonly cardAcquisitionService: CardAcquisitionService,
  ) {
    super(unitOfWork)
  }

  async handle(command: AuthorizePendingCardAcquisitionCommand) {
    return authorizePendingCardAcquisition(
      command,
      this.unitOfWork,
      this.cardAcquisitionService,
    )
  }
}
