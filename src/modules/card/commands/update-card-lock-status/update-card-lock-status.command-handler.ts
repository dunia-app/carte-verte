import { CommandHandler } from '@nestjs/cqrs'
import { UnitOfWork } from '../../../../infrastructure/database/unit-of-work/unit-of-work'
import { CommandHandlerBase } from '../../../../libs/ddd/domain/base-classes/command-handler.base'
import { UpdateCardLockStatusCommand } from './update-card-lock-status.command'
import { updateCardLockStatus } from './update-card-lock-status.service'

@CommandHandler(UpdateCardLockStatusCommand)
export class UpdateCardLockStatusCommandHandler extends CommandHandlerBase {
  constructor(protected readonly unitOfWork: UnitOfWork) {
    super(unitOfWork)
  }

  async handle(command: UpdateCardLockStatusCommand) {
    return updateCardLockStatus(command, this.unitOfWork)
  }
}
